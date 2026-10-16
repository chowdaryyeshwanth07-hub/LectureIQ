from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lecture import Lecture
from app.models.flashcard import Flashcard
from app.services.ai_service import ai_service

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])

class MasteryUpdateRequest(BaseModel):
    mastery_status: str # "learning", "reviewing", "mastered"

@router.post("/generate/{lecture_id}")
async def generate_flashcards(lecture_id: int, count: int = 6, db: Session = Depends(get_db)):
    """Generates a new deck of interactive flashcards for the lecture."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    new_cards = await ai_service.generate_flashcards(lecture.raw_text, count=count)
    created = []
    for card in new_cards:
        fc = Flashcard(
            lecture_id=lecture.id,
            question=card.get("question", ""),
            answer=card.get("answer", ""),
            concept=card.get("concept", "Key Term"),
            difficulty=card.get("difficulty", "Medium"),
            mastery_status="learning"
        )
        db.add(fc)
        db.commit()
        db.refresh(fc)
        created.append(fc)

    return [{"id": c.id, "question": c.question, "answer": c.answer, "concept": c.concept, "difficulty": c.difficulty, "mastery_status": c.mastery_status} for c in created]

@router.patch("/{card_id}")
def update_card_mastery(card_id: int, req: MasteryUpdateRequest, db: Session = Depends(get_db)):
    """Updates flashcard mastery rating (learning, reviewing, mastered)."""
    card = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    card.mastery_status = req.mastery_status
    card.review_count += 1
    card.last_reviewed_at = datetime.utcnow()
    db.commit()

    return {"message": "Flashcard status updated", "card_id": card.id, "mastery_status": card.mastery_status}
