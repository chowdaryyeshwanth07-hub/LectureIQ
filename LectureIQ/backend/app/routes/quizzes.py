import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lecture import Lecture
from app.models.quiz import QuizQuestion, QuizAttempt
from app.services.ai_service import ai_service

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

class QuizSubmission(BaseModel):
    answers: Dict[str, str] # question_id (as str) -> selected answer text

@router.post("/generate/{lecture_id}")
async def generate_lecture_quiz(lecture_id: int, count: int = 5, db: Session = Depends(get_db)):
    """Generates new test questions (MCQs and short answers) for a lecture."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    new_quiz = await ai_service.generate_quiz(lecture.raw_text, count=count)
    created = []
    for q in new_quiz:
        qq = QuizQuestion(
            lecture_id=lecture.id,
            question_text=q.get("question_text", ""),
            question_type=q.get("question_type", "mcq"),
            options=json.dumps(q.get("options", [])),
            correct_answer=q.get("correct_answer", ""),
            explanation=q.get("explanation", ""),
            difficulty=q.get("difficulty", "Medium"),
            topic=q.get("topic", "General")
        )
        db.add(qq)
        db.commit()
        db.refresh(qq)
        created.append(qq)

    return [
        {
            "id": item.id,
            "question_text": item.question_text,
            "question_type": item.question_type,
            "options": json.loads(item.options) if item.options else [],
            "correct_answer": item.correct_answer,
            "explanation": item.explanation,
            "difficulty": item.difficulty,
            "topic": item.topic
        }
        for item in created
    ]

@router.post("/submit/{lecture_id}")
def submit_quiz_attempt(lecture_id: int, submission: QuizSubmission, db: Session = Depends(get_db)):
    """Evaluates student submitted answers against correct answers and calculates metrics."""
    questions = db.query(QuizQuestion).filter(QuizQuestion.lecture_id == lecture_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No quiz questions found for this lecture")

    correct_count = 0
    feedback = []

    for q in questions:
        user_ans = submission.answers.get(str(q.id), "").strip()
        is_correct = False

        if q.question_type == "mcq":
            # Direct match or letter match
            if user_ans and (user_ans == q.correct_answer or user_ans[0] == q.correct_answer[0]):
                is_correct = True
        else:
            # Short answer keyword checking
            keywords = [w.lower() for w in q.correct_answer.split() if len(w) > 4]
            user_words = set(user_ans.lower().split())
            if any(k in user_words for k in keywords) or len(user_ans) > 20:
                is_correct = True

        if is_correct:
            correct_count += 1

        feedback.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "user_answer": user_ans,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct,
            "explanation": q.explanation
        })

    total = len(questions)
    percentage = round((correct_count / total * 100), 1) if total > 0 else 0.0

    attempt = QuizAttempt(
        lecture_id=lecture_id,
        total_questions=total,
        correct_count=correct_count,
        score_percentage=percentage,
        user_answers=json.dumps(submission.answers)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "score_percentage": percentage,
        "correct_count": correct_count,
        "total_questions": total,
        "feedback": feedback
    }
