from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsUpdate(BaseModel):
    ai_provider: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None

@router.get("/")
def get_settings():
    """Retrieves current AI provider configuration and masked API keys."""
    def mask_key(k: str) -> str:
        if not k:
            return ""
        if len(k) <= 8:
            return "********"
        return f"{k[:4]}...{k[-4:]}"

    return {
        "ai_provider": settings.AI_PROVIDER,
        "active_runtime": settings.AI_PROVIDER if settings.AI_PROVIDER != "auto" else (
            "gemini" if settings.GEMINI_API_KEY else (
                "openai" if settings.OPENAI_API_KEY else (
                    "groq" if settings.GROQ_API_KEY else "local"
                )
            )
        ),
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "has_openai_key": bool(settings.OPENAI_API_KEY),
        "has_groq_key": bool(settings.GROQ_API_KEY),
        "gemini_key_masked": mask_key(settings.GEMINI_API_KEY),
        "openai_key_masked": mask_key(settings.OPENAI_API_KEY),
        "groq_key_masked": mask_key(settings.GROQ_API_KEY),
        "version": settings.VERSION
    }

@router.post("/")
def update_settings(req: SettingsUpdate):
    """Updates AI provider preference and credentials."""
    if req.ai_provider:
        settings.AI_PROVIDER = req.ai_provider
    if req.gemini_api_key is not None:
        settings.GEMINI_API_KEY = req.gemini_api_key
    if req.openai_api_key is not None:
        settings.OPENAI_API_KEY = req.openai_api_key
    if req.groq_api_key is not None:
        settings.GROQ_API_KEY = req.groq_api_key

    return {"message": "Settings updated successfully", "active_provider": settings.AI_PROVIDER}
