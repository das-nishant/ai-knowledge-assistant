from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
    ConversationDetailResponse,
    ConversationUpdateTitle,
    MessageResponse,
    CitationSource,
)
from app.services.chat_service import generate_response
from app.repositories.conversation_repository import (
    get_conversations_by_user,
    get_conversation,
    update_conversation_title,
    delete_conversation,
)
from app.repositories.message_repository import get_messages

router = APIRouter(tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = generate_response(
        db=db,
        message=request.message,
        user_id=current_user.id,
        conversation_id=request.conversation_id,
        document_id=request.document_id,
    )

    formatted_sources = [
        CitationSource(
            filename=s["filename"],
            page=s.get("page"),
            content=s["content"]
        ) for s in result["sources"]
    ]

    return ChatResponse(
        response=result["response"],
        conversation_id=result["conversation_id"],
        title=result["title"],
        sources=formatted_sources,
    )


@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversations = get_conversations_by_user(db=db, user_id=current_user.id)
    results = []
    for conv in conversations:
        msgs = get_messages(db=db, conversation_id=conv.id)
        last_msg = msgs[-1].content if msgs else None
        results.append(
            ConversationResponse(
                id=conv.id,
                title=conv.title or "New Conversation",
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=len(msgs),
                last_message_preview=last_msg[:60] + "..." if last_msg and len(last_msg) > 60 else last_msg,
            )
        )
    return results


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation_detail(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = get_conversation(db=db, conversation_id=conversation_id, user_id=current_user.id)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    msgs = get_messages(db=db, conversation_id=conv.id)
    formatted_msgs = []
    for m in msgs:
        sources = None
        if m.sources and isinstance(m.sources, list):
            sources = [
                CitationSource(
                    filename=s["filename"],
                    page=s.get("page"),
                    content=s["content"]
                ) for s in m.sources
            ]
        formatted_msgs.append(
            MessageResponse(
                id=m.id,
                role=m.role,
                content=m.content,
                sources=sources,
                created_at=m.created_at,
            )
        )

    return ConversationDetailResponse(
        id=conv.id,
        title=conv.title or "New Conversation",
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=formatted_msgs,
    )


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
def rename_conversation(
    conversation_id: int,
    body: ConversationUpdateTitle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = update_conversation_title(
        db=db,
        conversation_id=conversation_id,
        title=body.title,
        user_id=current_user.id,
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    msgs = get_messages(db=db, conversation_id=conv.id)
    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        message_count=len(msgs),
        last_message_preview=msgs[-1].content[:60] if msgs else None,
    )


@router.delete("/conversations/{conversation_id}")
def remove_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    success = delete_conversation(db=db, conversation_id=conversation_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    return {"message": "Conversation deleted successfully", "conversation_id": conversation_id}