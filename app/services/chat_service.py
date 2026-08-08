import re
from sqlalchemy.orm import Session

from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser

from app.core.config import GROQ_API_KEY
from app.prompts.rag_prompt import rag_prompt
from app.rag.retriever import get_retriever, CHROMA_PERSIST_DIR
from app.rag.embeddings import get_embedding_model
from langchain_chroma import Chroma

from app.repositories.conversation_repository import (
    create_conversation,
    get_conversation,
)

from app.repositories.message_repository import (
    save_message,
    get_messages,
)

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=GROQ_API_KEY,
    temperature=0.2,
)

parser = StrOutputParser()

chain = rag_prompt | llm | parser


def generate_title(first_message: str) -> str:
    """Generate a clean 3-6 word title for the conversation based on the initial question."""
    try:
        title_prompt = f"Summarize this user question into a short 3-6 word conversation title without quotes or punctuation: '{first_message}'"
        res = llm.invoke(title_prompt)
        title = res.content.strip().strip('"').strip("'")
        return title if len(title) > 0 else first_message[:30]
    except Exception:
        return first_message[:30] + "..." if len(first_message) > 30 else first_message


def extract_target_page(query: str) -> int | None:
    """Extract page number from queries like 'page 1', 'page 12', 'p. 5', 'page number 5'."""
    match = re.search(r'\b(?:page|p\.?)\s*(?:number\s*)?(\d+)\b', query, re.IGNORECASE)
    if match:
        try:
            return int(match.group(1))
        except (ValueError, TypeError):
            return None
    return None


def generate_response(
    db: Session,
    message: str,
    user_id: int | None = None,
    conversation_id: int | None = None,
    document_id: int | None = None,
):
    # Create or load conversation
    if conversation_id is None:
        title = generate_title(message)
        conversation = create_conversation(db=db, user_id=user_id, title=title)
    else:
        conversation = get_conversation(db=db, conversation_id=conversation_id, user_id=user_id)
        if conversation is None:
            title = generate_title(message)
            conversation = create_conversation(db=db, user_id=user_id, title=title)

    # Load previous messages
    previous_messages = get_messages(
        db=db,
        conversation_id=conversation.id,
    )

    # Convert DB messages to LangChain messages
    history = []
    for msg in previous_messages:
        if msg.role == "user":
            history.append(HumanMessage(content=msg.content))
        else:
            history.append(AIMessage(content=msg.content))

    # General similarity retriever with top_k = 8
    top_k = 8
    retriever = get_retriever(user_id=user_id, document_id=document_id, top_k=top_k)
    docs = retriever.invoke(message)

    # Smart Page Number Detection & Comprehensive Retrieval
    target_page = extract_target_page(message)
    if target_page is not None:
        try:
            embeddings = get_embedding_model()
            vectorstore = Chroma(
                persist_directory=CHROMA_PERSIST_DIR,
                embedding_function=embeddings,
            )
            
            # Construct page filter
            filter_conditions = [{"page": target_page}]
            if user_id is not None:
                filter_conditions.append({"user_id": int(user_id)})
            if document_id is not None:
                filter_conditions.append({"document_id": int(document_id)})
            
            filter_dict = {"$and": filter_conditions} if len(filter_conditions) > 1 else filter_conditions[0]
            
            # Gather all chunks belonging to that page (k=8)
            page_specific_docs = vectorstore.similarity_search(
                query=message,
                k=8,
                filter=filter_dict,
            )

            # Prepend all page-specific docs to top of retrieval list
            existing_contents = {d.page_content for d in docs}
            extra_docs = [pd for pd in page_specific_docs if pd.page_content not in existing_contents]
            docs = extra_docs + docs
        except Exception as e:
            print(f"Page-specific search notice: {e}")

    sources = []
    context_parts = []
    for doc in docs:
        filename = doc.metadata.get("filename", "Document")
        page = doc.metadata.get("page", None)
        context_parts.append(f"[Source: {filename}, Page: {page if page else 'N/A'}]\n{doc.page_content}")
        
        # Deduplicate citations with expanded preview snippet (600 chars)
        source_obj = {
            "filename": filename,
            "page": page,
            "content": doc.page_content[:600] + ("..." if len(doc.page_content) > 600 else "")
        }
        if source_obj not in sources:
            sources.append(source_obj)

    context = "\n\n".join(context_parts) if context_parts else "No relevant context found in uploaded documents."

    # Save user message
    save_message(
        db=db,
        conversation_id=conversation.id,
        role="user",
        content=message,
    )

    # Generate AI response
    try:
        response = chain.invoke(
            {
                "history": history,
                "context": context,
                "question": message,
            }
        )
    except Exception as e:
        response = f"I encountered an error generating a response: {str(e)}"
        sources = []

    # Save AI response with sources
    save_message(
        db=db,
        conversation_id=conversation.id,
        role="assistant",
        content=response,
        sources=sources,
    )

    # Update conversation updated_at
    db.refresh(conversation)

    return {
        "response": response,
        "conversation_id": conversation.id,
        "title": conversation.title,
        "sources": sources,
    }