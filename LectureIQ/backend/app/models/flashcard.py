from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    lecture_id = Column(Integer, ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    concept = Column(String(150), default="Key Concept")
    difficulty = Column(String(50), default="Medium") # Easy, Medium, Hard
    mastery_status = Column(String(50), default="learning") # "learning", "reviewing", "mastered"
    review_count = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime, nullable=True)

    lecture = relationship("Lecture", back_populates="flashcards")
