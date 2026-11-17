import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    company_name = Column(String(255), nullable=True)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, RUNNING, COMPLETED, FAILED
    duration_seconds = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="research_sessions")
    report = relationship("ResearchReport", back_populates="session", uselist=False, cascade="all, delete-orphan")
    execution_records = relationship("AgentExecutionRecord", back_populates="session", cascade="all, delete-orphan")


class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    research_session_id = Column(String(36), ForeignKey("research_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    symbol = Column(String(20), nullable=False, index=True)
    overall_rating = Column(String(50), nullable=False)  # Bullish, Cautiously Bullish, Neutral, Cautiously Bearish, Bearish
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0
    executive_summary = Column(Text, nullable=False)
    
    # Detailed Agent Payloads stored as structured JSON
    fundamental_payload = Column(JSON, nullable=False)
    technical_payload = Column(JSON, nullable=False)
    sentiment_payload = Column(JSON, nullable=False)
    risk_payload = Column(JSON, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    session = relationship("ResearchSession", back_populates="report")


class AgentExecutionRecord(Base):
    __tablename__ = "agent_execution_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_session_id = Column(String(36), ForeignKey("research_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(50), nullable=False)  # supervisor, fundamental, technical, news, risk
    status = Column(String(50), nullable=False)  # PENDING, RUNNING, COMPLETED, FAILED, DEGRADED
    execution_time_ms = Column(Float, nullable=True)
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    session = relationship("ResearchSession", back_populates="execution_records")

