from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
)

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an AI Knowledge Assistant.

Rules:
- Answer clearly.
- Use Markdown.
- If you don't know something, say so honestly.
- Use previous conversation whenever it helps answer the user's question.
"""
        ),

        MessagesPlaceholder(variable_name="history"),

        (
            "human",
            "{question}"
        )
    ]
)