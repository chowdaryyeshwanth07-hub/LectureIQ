from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    lecture_id = Column(Integer, ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False) # "user", "assistant"
    content = Column(Text, nullable=False)
    citations = Column(Text, nullable=True) # JSON list of { "chunk_id", "heading", "excerpt", "timestamp" }
    created_at = Column(DateTime, default=datetime.utcnow)

    lecture = relationship("Lecture", back_populates="chat_messages")
