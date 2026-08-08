from datetime import datetime
from pydantic import BaseModel


class CitationSource(BaseModel):
    filename: str
    page: int | None = None
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None
    document_id: int | None = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: int
    title: str | None = None
    sources: list[CitationSource] = []


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: list[CitationSource] | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: int
    title: str | None = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message_preview: str | None = None

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    id: int
    title: str | None = None
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse] = []

    class Config:
        from_attributes = True


class ConversationUpdateTitle(BaseModel):
    title: str