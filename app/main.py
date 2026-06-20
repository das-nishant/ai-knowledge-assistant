from fastapi import FastAPI

app = FastAPI(
    title="AI Knowledge Assistant",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "AI Knowledge Assistant API is running"
    }