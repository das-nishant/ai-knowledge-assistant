from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.rag.loader import load_pdf


def split_documents(documents):
    """
    Split documents into larger, context-rich chunks (1000 chars with 200 overlap)
    to prevent data loss and fragmentation.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""],
    )

    chunks = splitter.split_documents(documents)
    return chunks


if __name__ == "__main__":
    docs = load_pdf("app/data/documents/ai_notes.pdf")
    chunks = split_documents(docs)
    print(f"Total Chunks: {len(chunks)}")
    print("-" * 50)
    print(chunks[0].page_content)
    print("-" * 50)
    print(chunks[0].metadata)