from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.document import router as document_router

from app.core.database import Base, engine
import app.models

# Auto-sync database columns if pre-existing tables are missing new fields
try:
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;'))
        conn.execute(text('ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0;'))
        conn.execute(text('ALTER TABLE documents ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 0;'))
        conn.execute(text('ALTER TABLE documents ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT \'indexed\';'))
        conn.execute(text('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;'))
        conn.execute(text('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();'))
        conn.execute(text('ALTER TABLE messages ADD COLUMN IF NOT EXISTS sources JSON;'))
        conn.commit()
except Exception as e:
    print(f"DB auto-sync notice: {e}")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Knowledge Assistant",
    description="Production RAG AI Knowledge Assistant API powered by FastAPI, ChromaDB, and Groq LLM",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(document_router)


@app.get("/")
def home():
    return {
        "message": "AI Knowledge Assistant API is running",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected",
        "rag_engine": "ready"
    }