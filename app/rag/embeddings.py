"""Embedding utilities for the RAG pipeline."""
from langchain_huggingface import HuggingFaceEmbeddings


def get_embedding_model():
    """
    Load and return the embedding model.
    """

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return embeddings


if __name__ == "__main__":

    embedding_model = get_embedding_model()

    vector = embedding_model.embed_query(
        "What is Artificial Intelligence?"
    )

    print(f"Vector Length: {len(vector)}")

    print()

    print(vector[:10])