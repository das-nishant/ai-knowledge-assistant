from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    file_size: int
    page_count: int
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class DocumentStats(BaseModel):
    total_documents: int
    total_file_size_bytes: int
    total_pages: int
    indexed_count: int


class DocumentSummaryResponse(BaseModel):
    document_id: int
    filename: str
    summary: str
