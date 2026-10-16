import json
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lecture import Lecture, TranscriptSegment, SectionChunk
from app.models.flashcard import Flashcard
from app.models.quiz import QuizQuestion
from app.services.export_service import export_service

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/{lecture_id}")
def export_lecture_package(
    lecture_id: int,
    format: str = Query("markdown", pattern="^(markdown|json)$"),
    db: Session = Depends(get_db)
):
    """Exports structured lecture summaries, flashcards, and notes as Markdown or JSON."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    segments = db.query(TranscriptSegment).filter(TranscriptSegment.lecture_id == lecture_id).all()
    flashcards = db.query(Flashcard).filter(Flashcard.lecture_id == lecture_id).all()
    quizzes = db.query(QuizQuestion).filter(QuizQuestion.lecture_id == lecture_id).all()

    lecture_data = {
        "title": lecture.title,
        "subject": lecture.subject,
        "source_type": lecture.source_type,
        "created_at": lecture.created_at,
        "executive_summary": lecture.executive_summary,
        "key_takeaways": lecture.key_takeaways,
        "smart_notes": lecture.smart_notes,
        "segments": [{"speaker": s.speaker, "start_time": s.start_time, "text": s.text} for s in segments],
        "flashcards": [{"question": f.question, "answer": f.answer, "concept": f.concept, "difficulty": f.difficulty, "mastery_status": f.mastery_status} for f in flashcards],
        "quizzes": [{"question_text": q.question_text, "question_type": q.question_type, "options": q.options, "correct_answer": q.correct_answer, "explanation": q.explanation} for q in quizzes]
    }

    if format == "markdown":
        content = export_service.to_markdown(lecture_data)
        filename = f"{lecture.title.replace(' ', '_')}_StudyPack.md"
        return Response(
            content=content,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        content = export_service.to_json(lecture_data)
        filename = f"{lecture.title.replace(' ', '_')}_StudyPack.json"
        return Response(
            content=content,
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
