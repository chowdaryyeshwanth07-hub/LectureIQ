from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
from app.database import get_db
from app.models.lecture import Lecture, TranscriptSegment
from app.services.transcription_service import transcription_service

router = APIRouter(prefix="/transcription", tags=["Transcription"])

@router.post("/{lecture_id}")
def transcribe_lecture(lecture_id: int, db: Session = Depends(get_db)):
    """Triggers speech transcription for an uploaded audio recording."""
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    if not lecture.file_path or not Path(lecture.file_path).exists():
        # Generate simulated transcription segments based on raw text
        segments_data = transcription_service.transcribe_audio(Path(lecture.file_path or "temp.wav"), lecture.title)
    else:
        segments_data = transcription_service.transcribe_audio(Path(lecture.file_path), lecture.title)

    # Clear old segments if any
    db.query(TranscriptSegment).filter(TranscriptSegment.lecture_id == lecture_id).delete()

    for seg in segments_data["segments"]:
        db.add(TranscriptSegment(
            lecture_id=lecture.id,
            start_time=seg["start_time"],
            end_time=seg["end_time"],
            speaker=seg["speaker"],
            text=seg["text"]
        ))
    lecture.duration_seconds = segments_data["duration"]
    db.commit()

    return {"message": "Transcription completed", "segment_count": len(segments_data["segments"])}
