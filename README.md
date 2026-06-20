# AI Knowledge Assistant

Simple FastAPI project structure for an AI chat assistant.

## Run

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the app:
   ```bash
   uvicorn app.main:app --reload
   ```

## API

- `POST /api/chat` - send a chat request
- `GET /` - health check
