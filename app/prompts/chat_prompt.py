from langchain_core.prompts import ChatPromptTemplate

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an AI Knowledge Assistant.

Rules:

- Explain concepts simply.
- Answer in beginner-friendly language.
- Keep answers concise.
- Avoid unnecessary technical jargon.
- If appropriate, use bullet points.
"""
        ),

        (
            "human",
            "{question}"
        )
    ]
)