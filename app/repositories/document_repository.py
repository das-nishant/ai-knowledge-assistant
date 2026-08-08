from sqlalchemy.orm import Session
from app.models.document import Document


def create_document(
    db: Session,
    filename: str,
    filepath: str,
    user_id: int | None = None,
    file_size: int = 0,
    page_count: int = 0,
    status: str = "indexed",
) -> Document:
    document = Document(
        filename=filename,
        filepath=filepath,
        user_id=user_id,
        file_size=file_size,
        page_count=page_count,
        status=status,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_documents_by_user(db: Session, user_id: int | None = None, search: str | None = None):
    query = db.query(Document)
    if user_id is not None:
        query = query.filter(Document.user_id == user_id)
    if search:
        query = query.filter(Document.filename.ilike(f"%{search}%"))
    return query.order_by(Document.uploaded_at.desc()).all()


def get_document_by_id(db: Session, document_id: int, user_id: int | None = None) -> Document | None:
    query = db.query(Document).filter(Document.id == document_id)
    if user_id is not None:
        query = query.filter(Document.user_id == user_id)
    return query.first()


def delete_document(db: Session, document_id: int, user_id: int | None = None) -> bool:
    doc = get_document_by_id(db, document_id, user_id)
    if doc:
        db.delete(doc)
        db.commit()
        return True
    return False


def update_document_status(db: Session, document_id: int, status: str) -> Document | None:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if doc:
        doc.status = status
        db.commit()
        db.refresh(doc)
    return doc