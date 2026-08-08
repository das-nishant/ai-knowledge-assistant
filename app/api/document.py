import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.rag.loader import load_pdf
from app.rag.vectorstore import create_vectorstore, delete_document_vectors
from app.repositories.document_repository import (
    create_document,
    get_documents_by_user,
    get_document_by_id,
    delete_document,
    update_document_status,
)
from app.schemas.document import DocumentResponse, DocumentStats

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

UPLOAD_FOLDER = "app/data/documents"


@router.get("", response_model=list[DocumentResponse])
@router.get("/", response_model=list[DocumentResponse])
def get_documents(
    search: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = get_documents_by_user(db=db, user_id=current_user.id, search=search)
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get("/stats", response_model=DocumentStats)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = get_documents_by_user(db=db, user_id=current_user.id)
    total_docs = len(docs)
    total_size = sum(d.file_size or 0 for d in docs)
    total_pages = sum(d.page_count or 0 for d in docs)
    indexed_count = sum(1 for d in docs if d.status == "indexed")

    return DocumentStats(
        total_documents=total_docs,
        total_file_size_bytes=total_size,
        total_pages=total_pages,
        indexed_count=indexed_count,
    )


@router.post("/upload", response_model=DocumentResponse)
@router.post("/upload/", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Extract clean basename
    clean_filename = Path(file.filename).name

    if not clean_filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    # Ensure user upload folder exists
    user_upload_dir = Path(UPLOAD_FOLDER) / str(current_user.id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = user_upload_dir / clean_filename

    contents = await file.read()
    file_size = len(contents)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Calculate page count
    try:
        pdf_docs = load_pdf(str(file_path))
        page_count = len(pdf_docs) if pdf_docs else 1
    except Exception:
        page_count = 1

    # Save to Postgres DB
    document = create_document(
        db=db,
        filename=clean_filename,
        filepath=str(file_path),
        user_id=current_user.id,
        file_size=file_size,
        page_count=page_count,
        status="processing",
    )

    # Index into ChromaDB
    try:
        create_vectorstore(
            file_path=str(file_path),
            user_id=current_user.id,
            document_id=document.id,
            filename=clean_filename,
        )
        update_document_status(db=db, document_id=document.id, status="indexed")
    except Exception as e:
        update_document_status(db=db, document_id=document.id, status="failed")
        print(f"Error indexing document {document.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to vector index document: {str(e)}",
        )

    db.refresh(document)
    return DocumentResponse.model_validate(document)


@router.delete("/{document_id}")
def remove_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = get_document_by_id(db=db, document_id=document_id, user_id=current_user.id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Remove vectors from ChromaDB
    delete_document_vectors(document_id=doc.id)

    # Remove file from disk
    if os.path.exists(doc.filepath):
        try:
            os.remove(doc.filepath)
        except Exception:
            pass

    # Delete from DB
    delete_document(db=db, document_id=doc.id, user_id=current_user.id)
    return {"message": "Document deleted successfully", "document_id": document_id}


@router.post("/{document_id}/reindex", response_model=DocumentResponse)
def reindex_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = get_document_by_id(db=db, document_id=document_id, user_id=current_user.id)
    if not doc or not os.path.exists(doc.filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found",
        )

    # Remove old vectors
    delete_document_vectors(document_id=doc.id)

    # Re-create vectors
    create_vectorstore(
        file_path=doc.filepath,
        user_id=current_user.id,
        document_id=doc.id,
        filename=doc.filename,
    )

    update_document_status(db=db, document_id=doc.id, status="indexed")
    db.refresh(doc)
    return DocumentResponse.model_validate(doc)