from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import generate_response

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    result = generate_response(
        db=db,
        message=request.message,
        conversation_id=request.conversation_id,
    )

    return ChatResponse(
        response=result["response"],
        conversation_id=result["conversation_id"],
    )