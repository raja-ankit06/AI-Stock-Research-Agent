from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.agent import (
    FundamentalAnalysisPayload,
    TechnicalAnalysisPayload,
    SentimentAnalysisPayload,
    RiskAnalysisPayload,
)


class CreateResearchRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20, description="Stock ticker symbol, e.g., NVDA, AAPL, RELIANCE.NS")


class ResearchSessionResponse(BaseModel):
    research_id: str
    symbol: str
    company_name: Optional[str] = None
    status: str
    created_at: datetime
    stream_url: str


class ResearchListItem(BaseModel):
    research_id: str
    symbol: str
    company_name: Optional[str] = None
    rating: Optional[str] = None
    confidence_score: Optional[float] = None
    status: str
    duration_seconds: Optional[float] = None
    created_at: datetime


class ResearchListResponse(BaseModel):
    items: List[ResearchListItem]
    total: int
    page: int
    page_size: int


class ReportResponse(BaseModel):
    report_id: str
    research_id: str
    symbol: str
    company_name: str
    overall_rating: str  # Bullish, Cautiously Bullish, Neutral, Cautiously Bearish, Bearish
    confidence_score: float
    executive_summary: str
    fundamental_payload: FundamentalAnalysisPayload
    technical_payload: TechnicalAnalysisPayload
    sentiment_payload: SentimentAnalysisPayload
    risk_payload: RiskAnalysisPayload
    disclaimer: str
    generated_at: datetime

