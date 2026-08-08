from langchain_community.document_loaders import PyPDFLoader


def load_pdf(file_path: str):
    """
    Load a PDF file and return a list of LangChain Documents.
    """

    loader = PyPDFLoader(file_path)

    documents = loader.load()

    return documents


if __name__ == "__main__":

    docs = load_pdf("app/data/documents/ai_notes.pdf")

    print(f"Total Pages: {len(docs)}")

    print("-" * 50)

    print(docs[0].page_content)

    print("-" * 50)

    print(docs[0].metadata)