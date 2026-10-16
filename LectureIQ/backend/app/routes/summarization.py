import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lecture import Lecture
from app.services.ai_service import ai_service

router = APIRouter(prefix="/summarization", tags=["Summarization"])

@router.post("/{lecture_id}/summary")
async def generate_lecture_summary(lecture_id: int, db: Session = Depends(get_db)):
    """Generates an executive summary and key takeaways for a lecture."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    summary_data = await ai_service.generate_summary(lecture.raw_text, lecture.title)
    lecture.executive_summary = summary_data.get("executive_summary", "")
    lecture.key_takeaways = json.dumps(summary_data.get("key_takeaways", []))
    db.commit()

    return {
        "executive_summary": lecture.executive_summary,
        "key_takeaways": summary_data.get("key_takeaways", []),
        "core_concepts": summary_data.get("core_concepts", [])
    }

@router.post("/{lecture_id}/notes")
async def generate_lecture_notes(lecture_id: int, db: Session = Depends(get_db)):
    """Generates comprehensive topic-wise smart study notes."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    smart_notes = await ai_service.generate_smart_notes(lecture.raw_text, lecture.title)
    lecture.smart_notes = smart_notes
    db.commit()

    return {"smart_notes": smart_notes}
