from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm import generate_response

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    answer = generate_response(request.message)

    return ChatResponse(response=answer)