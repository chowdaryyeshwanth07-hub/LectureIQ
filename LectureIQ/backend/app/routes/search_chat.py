import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lecture import Lecture, SectionChunk
from app.models.chat import ChatMessage
from app.services.vector_search import vector_search_service
from app.services.ai_service import ai_service

router = APIRouter(tags=["Search & Q&A"])

class ChatRequest(BaseModel):
    query: str

@router.post("/lectures/{lecture_id}/chat")
async def chat_with_lecture(lecture_id: int, req: ChatRequest, db: Session = Depends(get_db)):
    """Interactive Q&A assistant grounded in the lecture material with citations."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    chunks = db.query(SectionChunk).filter(SectionChunk.lecture_id == lecture_id).all()
    chunk_dicts = [
        {
            "id": c.id,
            "chunk_order": c.chunk_order,
            "heading": c.heading,
            "content": c.content,
            "start_time": c.start_time,
            "end_time": c.end_time
        }
        for c in chunks
    ]

    # Semantic retrieval for the top relevant chunks
    matched = vector_search_service.search_chunks(req.query, chunk_dicts, top_k=3)
    if not matched and chunk_dicts:
        matched = [{"chunk": chunk_dicts[0], "score": 0.5}]

    # AI synthesis
    ai_result = await ai_service.chat_rag(req.query, matched, [])

    # Save to history
    user_msg = ChatMessage(lecture_id=lecture_id, role="user", content=req.query)
    bot_msg = ChatMessage(
        lecture_id=lecture_id,
        role="assistant",
        content=ai_result["answer"],
        citations=json.dumps(ai_result.get("citations", []))
    )
    db.add(user_msg)
    db.add(bot_msg)
    db.commit()

    return {
        "answer": ai_result["answer"],
        "citations": ai_result.get("citations", [])
    }

@router.get("/lectures/{lecture_id}/chat-history")
def get_chat_history(lecture_id: int, db: Session = Depends(get_db)):
    """Retrieves conversation history for a specific lecture."""
    messages = db.query(ChatMessage).filter(ChatMessage.lecture_id == lecture_id).order_by(ChatMessage.created_at.asc()).all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "citations": json.loads(m.citations) if m.citations else [],
            "created_at": m.created_at
        }
        for m in messages
    ]

@router.get("/search")
def global_semantic_search(query: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    """Performs semantic search across all lectures, sections, and topics."""
    chunks = db.query(SectionChunk).all()
    chunk_dicts = []
    for c in chunks:
        lecture = db.query(Lecture).filter(Lecture.id == c.lecture_id).first()
        chunk_dicts.append({
            "id": c.id,
            "lecture_id": c.lecture_id,
            "lecture_title": lecture.title if lecture else "Unknown Lecture",
            "heading": c.heading,
            "content": c.content,
            "start_time": c.start_time
        })

    matched = vector_search_service.search_chunks(query, chunk_dicts, top_k=8)

    results = []
    for m in matched:
        c = m["chunk"]
        results.append({
            "chunk_id": c["id"],
            "lecture_id": c["lecture_id"],
            "lecture_title": c["lecture_title"],
            "heading": c["heading"],
            "content_snippet": c["content"][:280] + "...",
            "relevance_score": m["score"],
            "start_time": c.get("start_time")
        })

    return {"query": query, "total_matches": len(results), "results": results}
