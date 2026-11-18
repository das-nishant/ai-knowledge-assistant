"""Retriever utilities for the RAG pipeline."""
from langchain_chroma import Chroma
from app.rag.embeddings import get_embedding_model

CHROMA_PERSIST_DIR = "app/data/chroma_db"


def get_retriever(
    user_id: int | None = None,
    document_id: int | None = None,
    top_k: int = 6,
    search_type: str = "mmr",
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
    if search_type == "mmr":
        search_kwargs["fetch_k"] = max(top_k * 3, 15)
        search_kwargs["lambda_mult"] = 0.7

    if filter_dict:
        search_kwargs["filter"] = filter_dict

    try:
        retriever = vectorstore.as_retriever(
            search_type=search_type,
            search_kwargs=search_kwargs,
        )
    except Exception:
        # Fallback to similarity search if vectorstore has fewer documents than fetch_k
        search_kwargs.pop("fetch_k", None)
        search_kwargs.pop("lambda_mult", None)
        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs=search_kwargs,
        )

    return retriever
