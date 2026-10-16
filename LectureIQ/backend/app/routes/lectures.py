import os
import shutil
import json
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.config import settings
from app.models.lecture import Lecture, TranscriptSegment, SectionChunk
from app.models.flashcard import Flashcard
from app.models.quiz import QuizQuestion, QuizAttempt
from app.services.document_service import document_service
from app.services.transcription_service import transcription_service
from app.services.ai_service import ai_service
from app.utils.demo_data import DEMO_LECTURES

router = APIRouter(prefix="/lectures", tags=["Lectures"])

@router.get("/")
def get_all_lectures(db: Session = Depends(get_db)):
    """Retrieve all uploaded and processed lectures with summary statistics."""
    lectures = db.query(Lecture).order_by(Lecture.created_at.desc()).all()
    results = []
    for l in lectures:
        card_count = db.query(Flashcard).filter(Flashcard.lecture_id == l.id).count()
        quiz_count = db.query(QuizQuestion).filter(QuizQuestion.lecture_id == l.id).count()
        results.append({
            "id": l.id,
            "title": l.title,
            "subject": l.subject,
            "source_type": l.source_type,
            "duration_seconds": l.duration_seconds,
            "page_count": l.page_count,
            "status": l.status,
            "created_at": l.created_at,
            "has_summary": bool(l.executive_summary),
            "has_notes": bool(l.smart_notes),
            "flashcard_count": card_count,
            "quiz_count": quiz_count
        })
    return results

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Returns overarching student analytics, progress metrics, and recent activities."""
    total_lectures = db.query(Lecture).count()
    total_flashcards = db.query(Flashcard).count()
    mastered_cards = db.query(Flashcard).filter(Flashcard.mastery_status == "mastered").count()
    total_quizzes = db.query(QuizQuestion).count()
    attempts = db.query(QuizAttempt).all()
    
    avg_score = 0.0
    if attempts:
        avg_score = round(sum(a.score_percentage for a in attempts) / len(attempts), 1)

    recent_lectures = db.query(Lecture).order_by(Lecture.created_at.desc()).limit(5).all()

    return {
        "total_lectures": total_lectures,
        "total_flashcards": total_flashcards,
        "mastered_flashcards": mastered_cards,
        "flashcard_mastery_pct": round((mastered_cards / total_flashcards * 100), 1) if total_flashcards > 0 else 0,
        "total_quizzes": total_quizzes,
        "total_attempts": len(attempts),
        "average_quiz_score": avg_score,
        "recent_lectures": [
            {
                "id": l.id,
                "title": l.title,
                "subject": l.subject,
                "source_type": l.source_type,
                "created_at": l.created_at
            }
            for l in recent_lectures
        ]
    }

@router.post("/sample-seed")
def seed_sample_lectures(db: Session = Depends(get_db)):
    """Seeds rich sample lectures into the database for immediate testing."""
    created_count = 0
    for demo in DEMO_LECTURES:
        exists = db.query(Lecture).filter(Lecture.title == demo["title"]).first()
        if exists:
            continue

        lecture = Lecture(
            title=demo["title"],
            subject=demo["subject"],
            source_type=demo["source_type"],
            duration_seconds=demo.get("duration_seconds", 0.0),
            page_count=demo.get("page_count", 0),
            status="ready",
            executive_summary=demo.get("executive_summary"),
            key_takeaways=demo.get("key_takeaways"),
            smart_notes=demo.get("smart_notes"),
            raw_text=" ".join([c["content"] for c in demo.get("chunks", [])]) or demo.get("executive_summary", "")
        )
        db.add(lecture)
        db.commit()
        db.refresh(lecture)

        # Segments
        for seg in demo.get("segments", []):
            db.add(TranscriptSegment(
                lecture_id=lecture.id,
                start_time=seg["start_time"],
                end_time=seg["end_time"],
                speaker=seg["speaker"],
                text=seg["text"]
            ))

        # Chunks
        for chk in demo.get("chunks", []):
            db.add(SectionChunk(
                lecture_id=lecture.id,
                chunk_order=chk["chunk_order"],
                heading=chk["heading"],
                content=chk["content"],
                start_time=chk.get("start_time"),
                end_time=chk.get("end_time")
            ))

        # Flashcards
        for fc in demo.get("flashcards", []):
            db.add(Flashcard(
                lecture_id=lecture.id,
                question=fc["question"],
                answer=fc["answer"],
                concept=fc.get("concept", "Key Concept"),
                difficulty=fc.get("difficulty", "Medium"),
                mastery_status=fc.get("mastery_status", "learning")
            ))

        # Quizzes
        for q in demo.get("quizzes", []):
            db.add(QuizQuestion(
                lecture_id=lecture.id,
                question_text=q["question_text"],
                question_type=q["question_type"],
                options=q.get("options"),
                correct_answer=q["correct_answer"],
                explanation=q.get("explanation"),
                difficulty=q.get("difficulty", "Medium"),
                topic=q.get("topic", "General")
            ))

        db.commit()
        created_count += 1

    return {"message": f"Successfully seeded {created_count} sample lectures.", "total_seeded": created_count}

@router.post("/upload")
async def upload_lecture(
    title: str = Form(...),
    subject: str = Form("General"),
    source_type: str = Form("text"), # "audio", "pdf", "text"
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Handles upload of audio, PDF, or text notes, extracting contents & chunking."""
    extracted_text = raw_text or ""
    page_count = 1
    duration = 0.0
    saved_file_path = None

    if file:
        file_ext = Path(file.filename).suffix.lower()
        save_name = f"{file.filename}"
        dest = settings.UPLOAD_DIR / save_name
        with open(dest, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_file_path = str(dest)

        if file_ext == ".pdf":
            source_type = "pdf"
            pdf_data = document_service.extract_text_from_pdf(dest)
            extracted_text = pdf_data["text"]
            page_count = pdf_data["page_count"]
        elif file_ext in [".mp3", ".wav", ".m4a", ".webm", ".ogg"]:
            source_type = "audio"
            trans_data = transcription_service.transcribe_audio(dest, title)
            extracted_text = trans_data["full_text"]
            duration = trans_data["duration"]
        elif file_ext in [".txt", ".md"]:
            source_type = "text"
            txt_data = document_service.extract_text_from_txt(dest)
            extracted_text = txt_data["text"]
            page_count = txt_data["page_count"]

    if not extracted_text.strip():
        extracted_text = f"Lecture notes on {title}. Content loaded for analysis."

    # Create Lecture
    lecture = Lecture(
        title=title,
        subject=subject,
        source_type=source_type,
        file_path=saved_file_path,
        raw_text=extracted_text,
        duration_seconds=duration,
        page_count=page_count,
        status="ready"
    )
    db.add(lecture)
    db.commit()
    db.refresh(lecture)

    # Chunk the content for semantic RAG
    chunks = document_service.chunk_content(extracted_text)
    for c in chunks:
        db.add(SectionChunk(
            lecture_id=lecture.id,
            chunk_order=c["chunk_order"],
            heading=c["heading"],
            content=c["content"]
        ))
    db.commit()

    # Automatically generate initial Summary, Smart Notes, Flashcards & Quiz!
    try:
        summary_data = await ai_service.generate_summary(extracted_text, title)
        lecture.executive_summary = summary_data.get("executive_summary", "")
        lecture.key_takeaways = json.dumps(summary_data.get("key_takeaways", []))

        notes = await ai_service.generate_smart_notes(extracted_text, title)
        lecture.smart_notes = notes

        cards = await ai_service.generate_flashcards(extracted_text, count=6)
        for card in cards:
            db.add(Flashcard(
                lecture_id=lecture.id,
                question=card.get("question", ""),
                answer=card.get("answer", ""),
                concept=card.get("concept", "Key Term"),
                difficulty=card.get("difficulty", "Medium")
            ))

        quiz_items = await ai_service.generate_quiz(extracted_text, count=4)
        for q in quiz_items:
            db.add(QuizQuestion(
                lecture_id=lecture.id,
                question_text=q.get("question_text", ""),
                question_type=q.get("question_type", "mcq"),
                options=json.dumps(q.get("options", [])),
                correct_answer=q.get("correct_answer", ""),
                explanation=q.get("explanation", ""),
                difficulty=q.get("difficulty", "Medium"),
                topic=q.get("topic", "General")
            ))
        db.commit()
    except Exception as e:
        print(f"[Auto generation warning]: {e}")

    return {"message": "Lecture uploaded and processed successfully", "lecture_id": lecture.id}

@router.get("/{lecture_id}")
def get_lecture_details(lecture_id: int, db: Session = Depends(get_db)):
    """Fetches complete lecture package including transcript, summary, notes, flashcards & quiz."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    segments = db.query(TranscriptSegment).filter(TranscriptSegment.lecture_id == lecture_id).all()
    chunks = db.query(SectionChunk).filter(SectionChunk.lecture_id == lecture_id).all()
    flashcards = db.query(Flashcard).filter(Flashcard.lecture_id == lecture_id).all()
    quizzes = db.query(QuizQuestion).filter(QuizQuestion.lecture_id == lecture_id).all()

    takeaways = []
    if lecture.key_takeaways:
        try:
            takeaways = json.loads(lecture.key_takeaways)
        except Exception:
            takeaways = [lecture.key_takeaways]

    return {
        "id": lecture.id,
        "title": lecture.title,
        "subject": lecture.subject,
        "source_type": lecture.source_type,
        "duration_seconds": lecture.duration_seconds,
        "page_count": lecture.page_count,
        "created_at": lecture.created_at,
        "executive_summary": lecture.executive_summary,
        "key_takeaways": takeaways,
        "smart_notes": lecture.smart_notes,
        "raw_text": lecture.raw_text,
        "segments": [
            {
                "id": s.id,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "speaker": s.speaker,
                "text": s.text
            }
            for s in segments
        ],
        "chunks": [
            {
                "id": c.id,
                "chunk_order": c.chunk_order,
                "heading": c.heading,
                "content": c.content,
                "start_time": c.start_time,
                "end_time": c.end_time
            }
            for c in chunks
        ],
        "flashcards": [
            {
                "id": f.id,
                "question": f.question,
                "answer": f.answer,
                "concept": f.concept,
                "difficulty": f.difficulty,
                "mastery_status": f.mastery_status,
                "review_count": f.review_count
            }
            for f in flashcards
        ],
        "quizzes": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "options": json.loads(q.options) if q.options else [],
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
                "difficulty": q.difficulty,
                "topic": q.topic
            }
            for q in quizzes
        ]
    }

@router.delete("/{lecture_id}")
def delete_lecture(lecture_id: int, db: Session = Depends(get_db)):
    """Deletes a lecture and all associated study materials."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    db.delete(lecture)
    db.commit()
    return {"message": "Lecture deleted successfully"}
