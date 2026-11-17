from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class FundamentalAnalysisPayload(BaseModel):
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    net_margin: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    free_cash_flow: Optional[float] = None
    revenue_growth_3y: Optional[float] = None
    strengths: List[str] = Field(default_factory=list, description="Top fundamental strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Top fundamental weaknesses")
    summary: str = Field(..., description="Qualitative summary of fundamental health")


class TechnicalAnalysisPayload(BaseModel):
    trend: str = Field(..., description="Overall trend: Bullish, Bearish, or Neutral")
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    rsi_14: Optional[float] = None
    macd_status: str = Field(..., description="Bullish Crossover, Bearish Crossover, Neutral")
    bollinger_position: str = Field(..., description="Near Upper Band, Near Lower Band, Mid-Range")
    support_level: Optional[float] = None
    resistance_level: Optional[float] = None
    momentum_summary: str = Field(..., description="Key technical indicators and price action summary")


class NewsItemDTO(BaseModel):
    headline: str
    publisher: str
    published_at: str
    url: Optional[str] = None
    sentiment_score: float  # -1.0 to 1.0
    sentiment_label: str  # BULLISH, NEUTRAL, BEARISH
    summary: str


class SentimentAnalysisPayload(BaseModel):
    composite_score: float = Field(..., description="Overall sentiment from -1.0 to +1.0")
    sentiment_label: str = Field(..., description="Bullish, Neutral, or Bearish")
    articles_analyzed: int
    top_catalysts: List[str] = Field(default_factory=list, description="Upcoming events or market catalysts")
    news_items: List[NewsItemDTO] = Field(default_factory=list)


class ContradictionItem(BaseModel):
    title: str
    description: str
    severity: str = "WARNING"  # WARNING, CRITICAL


class RiskAnalysisPayload(BaseModel):
    overall_risk_level: str = Field(..., description="Low, Moderate, High, or Critical")
    beta: Optional[float] = None
    max_drawdown_1y: Optional[float] = None
    volatility_30d: Optional[float] = None
    detected_contradictions: List[ContradictionItem] = Field(default_factory=list)
    key_risk_factors: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


class AgentStatusEvent(BaseModel):
    step: str
    agent: str
    progress: int  # 0 to 100
    status: str  # PENDING, RUNNING, COMPLETED, DEGRADED, FAILED
    message: str

