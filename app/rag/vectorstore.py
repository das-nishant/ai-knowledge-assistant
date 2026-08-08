"""Vector store utilities for the RAG pipeline."""
from langchain_chroma import Chroma
from langchain_core.documents import Document as LCDocument
import os

from app.rag.loader import load_pdf
from app.rag.splitter import split_documents
from app.rag.embeddings import get_embedding_model

CHROMA_PERSIST_DIR = "app/data/chroma_db"


def get_vectorstore():
    embeddings = get_embedding_model()
    return Chroma(
        persist_directory=CHROMA_PERSIST_DIR,
        embedding_function=embeddings,
    )


def create_vectorstore(
    file_path: str,
    user_id: int | None = None,
    document_id: int | None = None,
    filename: str | None = None,
):
    clean_filename = filename or os.path.basename(file_path)

    # Load PDF
    try:
        documents = load_pdf(file_path)
    except Exception as e:
        print(f"Warning: load_pdf error for {file_path}: {e}")
        documents = []

    # Split PDF
    if documents:
        chunks = split_documents(documents)
    else:
        chunks = []

    # Fallback if no text chunks extracted (e.g., image-only or empty PDF)
    if not chunks:
        chunks = [
            LCDocument(
                page_content=f"Document title: {clean_filename}. No extractable text found in file.",
                metadata={"page": 1}
            )
        ]

    # Enrich metadata and prepend page headers for page-specific embeddings
    for chunk in chunks:
        chunk.metadata["filename"] = clean_filename
        if user_id is not None:
            chunk.metadata["user_id"] = int(user_id)
        if document_id is not None:
            chunk.metadata["document_id"] = int(document_id)
        
        page_num = 1
        if "page" in chunk.metadata:
            try:
                raw_page = int(chunk.metadata["page"])
                # PyPDFLoader metadata['page'] is 0-indexed (0=Page 1, 4=Page 5, 5=Page 6).
                # Always add 1 to get exact 1-indexed human physical page numbers!
                page_num = raw_page + 1
                chunk.metadata["page"] = page_num
            except (ValueError, TypeError):
                chunk.metadata["page"] = 1

        # Prepend explicit page header so dense embeddings match queries like 'page 5' or 'page 12'
        header = f"Page {page_num} of {clean_filename}: "
        if not chunk.page_content.startswith("Page "):
            chunk.page_content = header + chunk.page_content

    # Embedding model
    embeddings = get_embedding_model()

    # Store in ChromaDB
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PERSIST_DIR,
    )

    return vectorstore


def delete_document_vectors(document_id: int):
    try:
        vectorstore = get_vectorstore()
        # Delete items matching document_id metadata
        vectorstore._collection.delete(where={"document_id": int(document_id)})
        return True
    except Exception as e:
        print(f"Error deleting vectors for document {document_id}: {e}")
        return False