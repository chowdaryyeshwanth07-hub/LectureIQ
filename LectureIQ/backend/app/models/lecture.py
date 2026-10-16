from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), default="General")
    source_type = Column(String(50), default="text") # "audio", "pdf", "text"
    file_path = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False, default="")
    duration_seconds = Column(Float, default=0.0)
    page_count = Column(Integer, default=0)
    status = Column(String(50), default="ready") # "ready", "processing", "error"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Generated Summaries & Notes
    executive_summary = Column(Text, nullable=True)
    key_takeaways = Column(Text, nullable=True) # JSON or markdown string
    smart_notes = Column(Text, nullable=True) # JSON or markdown string

    # Relationships
    segments = relationship("TranscriptSegment", back_populates="lecture", cascade="all, delete-orphan", order_by="TranscriptSegment.start_time")
    chunks = relationship("SectionChunk", back_populates="lecture", cascade="all, delete-orphan", order_by="SectionChunk.chunk_order")
    flashcards = relationship("Flashcard", back_populates="lecture", cascade="all, delete-orphan")
    quizzes = relationship("QuizQuestion", back_populates="lecture", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="lecture", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="lecture", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    lecture_id = Column(Integer, ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(Float, nullable=False, default=0.0)
    end_time = Column(Float, nullable=False, default=0.0)
    speaker = Column(String(50), default="Speaker 1")
    text = Column(Text, nullable=False)

    lecture = relationship("Lecture", back_populates="segments")

class SectionChunk(Base):
    __tablename__ = "section_chunks"

    id = Column(Integer, primary_key=True, index=True)
    lecture_id = Column(Integer, ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    chunk_order = Column(Integer, default=0)
    heading = Column(String(255), default="General")
    content = Column(Text, nullable=False)
    start_time = Column(Float, nullable=True)
    end_time = Column(Float, nullable=True)
    page_number = Column(Integer, nullable=True)

    lecture = relationship("Lecture", back_populates="chunks")
