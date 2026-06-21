from langchain_groq import ChatGroq

from app.core.config import GROQ_API_KEY
from app.prompts.chat_prompt import chat_prompt


llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=GROQ_API_KEY
)


def generate_response(message: str):

    prompt = chat_prompt.invoke(
        {
            "question": message
        }
    )

    response = llm.invoke(prompt)

    return response.content