# 🚀 AI Knowledge Assistant — Enterprise RAG SaaS Application

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![ChromaDB](https://img.shields.io/badge/VectorDB-ChromaDB-FF6F61?style=flat-square)](https://www.trychroma.com/)
[![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.1-F05032?style=flat-square)](https://groq.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

A production-grade, full-stack **Retrieval-Augmented Generation (RAG)** SaaS web application built with **FastAPI**, **React + Vite**, **PostgreSQL**, **ChromaDB**, and **Groq Llama 3.1 8B Instant**.

The platform allows users to upload PDF documents, ask natural language questions, generate instant AI Executive Summaries, and receive grounded answers with precise physical page citations and source snippet popovers.

---

## 📌 Key Features

- ⚡ **Instant Non-Blocking PDF Upload & Async Indexing**: Upload PDFs in **< 150 milliseconds** using FastAPI `BackgroundTasks`. Vector embeddings are generated asynchronously without blocking the server.
- 📌 **AI Executive Summary & Key Takeaways Generator**: Click **AI Summary** on any uploaded PDF to instantly generate an Executive Summary, Key Takeaways, and Suggested Questions powered by Groq Llama 3.1.
- 🔍 **Smart Page Query Detection & 1-Indexed Citations**: Automated regex parser detects queries like `"page 5"` or `"tell me about page number 50"`, performing targeted ChromaDB metadata filters matching physical PDF pages 1-to-1.
- 🛡️ **Token Safety & Groq 6000 TPM Fallback**: Strict 4,000-character prompt context budgeting and 413 rate-limit retry handlers prevent token overflow errors.
- 📥 **Export Chat History to Markdown (`.md`)**: Download Q&A conversation threads with dates, questions, answers, and source citations as clean Markdown files.
- 🔐 **JWT Auth & Multi-Tenant User Isolation**: User registration, login, and tenant isolation across PostgreSQL databases and ChromaDB metadata tags (`user_id`, `document_id`).
- 🎨 **Modern Glassmorphism UI**: Dashboard analytics, interactive citation popovers, document search filtering, title renaming, and dark mode theme.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User([👤 User Browser]) -->|React + Vite Frontend| FE[Vite Dev / Prod Bundle]
    FE -->|HTTP / REST API + JWT Bearer| API[FastAPI Backend Engine]
    
    subgraph Backend Services
        API --> Auth[Auth Service - JWT / Passlib]
        API --> DocService[Document Service]
        API --> ChatService[RAG Chat Engine]
    end
    
    subgraph Data & Storage Layers
        Auth --> DB[(PostgreSQL Database)]
        DocService --> DB
        DocService --> Disk[PDF File Storage]
        DocService --> BG[FastAPI Background Indexer]
        
        BG --> Splitter[Recursive Text Splitter]
        Splitter --> Embeddings[HuggingFace Embeddings Model]
        Embeddings --> Chroma[(ChromaDB Vector Store)]
        
        ChatService --> Chroma
        ChatService --> LLM[Groq Llama 3.1 8B Instant LLM]
    end
```

---

## 📂 Project Directory Structure

```text
ai-knowledge-assistant/
├── app/                        # FastAPI Backend Application
│   ├── main.py                 # FastAPI App Entrypoint, CORS, DB Column Sync
│   ├── api/                    # API Route Controllers
│   │   ├── auth.py             # User Register, Login, Me Endpoints
│   │   ├── document.py         # Document Upload, Summary, Delete, Stats, Reindex
│   │   ├── chat.py             # RAG Chat Q&A & Conversation History Endpoints
│   │   └── deps.py             # Dependency Injection (Auth Token & DB Session)
│   ├── core/                   # System Configuration & Security
│   │   ├── config.py           # Environment Variables (DB URL, Groq API Key)
│   │   ├── database.py         # SQLAlchemy DB Session & Engine setup
│   │   └── security.py         # JWT Token Generation & Password Hashing
│   ├── models/                 # SQLAlchemy Database Models
│   │   ├── user.py             # User Table Schema
│   │   ├── document.py         # Document Table Schema
│   │   └── conversation.py     # Conversation & Message Table Schemas
│   ├── rag/                    # RAG Pipeline Engine
│   │   ├── loader.py           # PyPDFLoader Document Extractor
│   │   ├── splitter.py         # RecursiveCharacterTextSplitter (1000 chars)
│   │   ├── embeddings.py       # Global In-Memory Cached Embedding Model
│   │   ├── vectorstore.py      # ChromaDB Vector Storage & 1-Indexed Metadata
│   │   └── retriever.py        # Vector Similarity & Page Filter Retriever
│   ├── repositories/           # Database Access Layer (Queries & CRUD)
│   ├── schemas/                # Pydantic Schemas & DTOs
│   └── services/               # Core Business & Chat Logic
│       └── chat_service.py     # Grounded Q&A, Page Extraction & Token Budgeting
│
├── frontend/                   # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Layout, Navbar, Sidebar, Protected Routes
│   │   ├── pages/              # Dashboard, Chat, Documents, History, Settings
│   │   ├── services/           # Axios API Services (Auth, Documents, Chat)
│   │   ├── store/              # Zustand State Management Stores
│   │   └── types/              # TypeScript Interfaces & DTOs
│   ├── package.json            # Node.js Dependencies
│   └── vite.config.ts          # Vite Configuration & Dev Server
│
├── requirements.txt            # Python Dependencies
├── .env                        # Environment Variables Configuration
└── README.md                   # Project Documentation
```

---

## 🛠️ Prerequisites & Installation Guide

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **PostgreSQL**: Local PostgreSQL server or cloud database instance

---

### 1. Backend Setup (FastAPI)

1. **Clone the repository**:
   ```powershell
   git clone https://github.com/das-nishant/ai-knowledge-assistant.git
   cd ai-knowledge-assistant
   ```

2. **Create and activate a Python virtual environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate
   ```

3. **Install Python dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables (`.env`)**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://postgres:Junior03@localhost:5432/ai_knowledge_assistant
   SECRET_KEY=your_super_secret_jwt_key_here
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

5. **Start the FastAPI Backend Server**:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will run at `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`).

---

### 2. Frontend Setup (React + Vite)

1. **Navigate to the `frontend` directory**:
   ```powershell
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```powershell
   npm install
   ```

3. **Start the Vite Development Server**:
   ```powershell
   npm run dev
   ```
   The frontend application will launch at `http://localhost:5173`.

---

## 📡 API Reference Summary

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/auth/register` | `POST` | Register a new user account |
| `/auth/login` | `POST` | Authenticate user and issue JWT access token |
| `/auth/me` | `GET` | Fetch authenticated user profile details |
| `/documents` | `GET` | List user documents with search filter |
| `/documents/stats` | `GET` | Get total documents, page count, and storage stats |
| `/documents/upload` | `POST` | Upload PDF and start background vector indexing |
| `/documents/{id}/summary` | `POST` | Generate AI Executive Summary & Key Takeaways |
| `/documents/{id}` | `DELETE` | Delete document, disk file, and vector embeddings |
| `/documents/{id}/reindex` | `POST` | Re-index document chunks into ChromaDB |
| `/chat` | `POST` | Send RAG Q&A prompt and receive cited response |
| `/conversations` | `GET` | List past conversation history |
| `/conversations/{id}` | `GET` | Get message trajectory for a conversation |
| `/conversations/{id}` | `PUT` | Rename conversation title |
| `/conversations/{id}` | `DELETE` | Delete conversation history |

---

## 📝 License & Author

**Author**: Senior AI Engineer  
**Project**: AI Knowledge Assistant (Full-Stack RAG SaaS)  
**License**: MIT License
