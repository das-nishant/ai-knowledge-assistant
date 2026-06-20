from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm import LLMService

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response_text = await LLMService().generate_response(request.message)
        return ChatResponse(reply=response_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
