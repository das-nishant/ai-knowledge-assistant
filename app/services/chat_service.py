from sqlalchemy.orm import Session

from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser

from app.core.config import GROQ_API_KEY
from app.prompts.chat_prompt import chat_prompt

from app.repositories.conversation_repository import (
    create_conversation,
    get_conversation,
)

from app.repositories.message_repository import (
    save_message,
)

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=GROQ_API_KEY
)

parser = StrOutputParser()

chain = chat_prompt | llm | parser


def generate_response(
    db: Session,
    message: str,
    conversation_id: int | None = None,
):
    # Create a new conversation if none exists
    if conversation_id is None:
        conversation = create_conversation(db)
    else:
        conversation = get_conversation(db, conversation_id)

        if conversation is None:
            conversation = create_conversation(db)

    # Save the user's message
    save_message(
        db=db,
        conversation_id=conversation.id,
        role="user",
        content=message,
    )

    # Generate AI response
    response = chain.invoke(
        {
            "question": message
        }
    )

    # Save the AI response
    save_message(
        db=db,
        conversation_id=conversation.id,
        role="assistant",
        content=response,
    )

    return {
        "response": response,
        "conversation_id": conversation.id,
    }