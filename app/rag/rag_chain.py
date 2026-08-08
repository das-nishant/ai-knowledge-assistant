from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser

from app.core.config import GROQ_API_KEY
from app.prompts.rag_prompt import rag_prompt
from app.rag.retriever import get_retriever


llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=GROQ_API_KEY,
)

parser = StrOutputParser()


def generate_rag_response(question: str):

    # Step 1: Retrieve relevant documents
    retriever = get_retriever()

    docs = retriever.invoke(question)

    # Step 2: Combine retrieved chunks
    context = "\n\n".join(
        doc.page_content for doc in docs
    )

    # Step 3: Create the chain
    chain = rag_prompt | llm | parser

    # Step 4: Generate answer
    response = chain.invoke(
        {
            "context": context,
            "question": question,
        }
    )

    return response


if __name__ == "__main__":

    question = "What is Deep Learning?"

    answer = generate_rag_response(question)

    print(answer)