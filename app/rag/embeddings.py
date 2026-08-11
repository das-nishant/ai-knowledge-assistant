"""Embedding utilities for the RAG pipeline."""
from langchain_huggingface import HuggingFaceEmbeddings

_EMBEDDING_MODEL_CACHE = None


def get_embedding_model():
    """
    Load and cache the embedding model globally in memory.
    Prevents reloading PyTorch model weights from disk on every single request.
    """
    global _EMBEDDING_MODEL_CACHE
    if _EMBEDDING_MODEL_CACHE is None:
        _EMBEDDING_MODEL_CACHE = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    return _EMBEDDING_MODEL_CACHE


if __name__ == "__main__":
    embedding_model = get_embedding_model()
    vector = embedding_model.embed_query("What is Artificial Intelligence?")
    print(f"Vector Length: {len(vector)}")
    print(vector[:10])