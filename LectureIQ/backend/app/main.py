import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
import app.models # Ensures all models are registered

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LectureIQ: AI Lecture-to-Learning Platform. Transcribe, summarize, generate flashcards, quizzes, and grounded RAG Q&A."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register API routers
from app.routes.lectures import router as lectures_router
from app.routes.transcription import router as transcription_router
from app.routes.summarization import router as summarization_router
from app.routes.flashcards import router as flashcards_router
from app.routes.quizzes import router as quizzes_router
from app.routes.search_chat import router as search_chat_router
from app.routes.export import router as export_router
from app.routes.settings import router as settings_router
from app.routes.backtest import router as backtest_router

app.include_router(lectures_router, prefix=settings.API_PREFIX)
app.include_router(transcription_router, prefix=settings.API_PREFIX)
app.include_router(summarization_router, prefix=settings.API_PREFIX)
app.include_router(flashcards_router, prefix=settings.API_PREFIX)
app.include_router(quizzes_router, prefix=settings.API_PREFIX)
app.include_router(search_chat_router, prefix=settings.API_PREFIX)
app.include_router(export_router, prefix=settings.API_PREFIX)
app.include_router(settings_router, prefix=settings.API_PREFIX)
app.include_router(backtest_router, prefix=settings.API_PREFIX)

# Static file serving for uploads if needed
if settings.UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "message": "Welcome to LectureIQ API! Access /docs for interactive Swagger UI."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
