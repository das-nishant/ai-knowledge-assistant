import re
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.rag.loader import load_pdf


def clean_text(text: str) -> str:
    """Clean text by fixing broken hyphenations and normalizing whitespace."""
    if not text:
        return ""
    # Fix hyphenated words across newlines (e.g. "connec-\ntion" -> "connection")
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    # Replace multiple consecutive empty lines with double newline
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Replace tabs and multiple horizontal spaces with a single space
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def split_documents(documents):
    """
    Split documents into larger, context-rich chunks (1000 chars with 200 overlap)
    to prevent data loss and fragmentation.
    """
    for doc in documents:
        doc.page_content = clean_text(doc.page_content)

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