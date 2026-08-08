"""Retriever utilities for the RAG pipeline."""
from langchain_chroma import Chroma
from app.rag.embeddings import get_embedding_model

CHROMA_PERSIST_DIR = "app/data/chroma_db"


def get_retriever(
    user_id: int | None = None,
    document_id: int | None = None,
    top_k: int = 8,
):
    embeddings = get_embedding_model()

    vectorstore = Chroma(
        persist_directory=CHROMA_PERSIST_DIR,
        embedding_function=embeddings,
    )

    filter_dict = {}
    if user_id is not None and document_id is not None:
        filter_dict = {
            "$and": [
                {"user_id": int(user_id)},
                {"document_id": int(document_id)},
            ]
        }
    elif user_id is not None:
        filter_dict = {"user_id": int(user_id)}
    elif document_id is not None:
        filter_dict = {"document_id": int(document_id)}

    search_kwargs = {"k": top_k}
    if filter_dict:
        search_kwargs["filter"] = filter_dict

    retriever = vectorstore.as_retriever(search_kwargs=search_kwargs)
    return retriever