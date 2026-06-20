from fastapi import FastAPI

from app.api.chat import router as chat_router

app = FastAPI(
    title="AI Knowledge Assistant",
    version="1.0.0"
)

app.include_router(chat_router)


@app.get("/")
def home():
    return {
        "message": "AI Knowledge Assistant API is running"
    }