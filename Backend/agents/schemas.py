from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class FundamentalOutput(BaseModel):
    ticker: str
    revenue_trend: str
    profitability_status: str
    debt_status: str
    ratios: Dict[str, Optional[float]]  # P/E, P/B, ROE
    missing_data: List[str]
    summary: str

class TechnicalOutput(BaseModel):
    ticker: str
    latest_close: Optional[float]
    sma_20: Optional[float]
    ema_20: Optional[float]
    rsi_14: Optional[float]
    macd: Optional[float]
    macd_signal: Optional[float]
    historical_volatility: Optional[float]
    trend_signal: str  # "Upward", "Downward", "Mixed"
    chart_data: List[Dict[str, Any]]
    summary: str

class NewsItem(BaseModel):
    title: str
    source: str
    url: str
    published_at: str
    sentiment: str  # "Positive", "Negative", "Neutral"

class NewsOutput(BaseModel):
    ticker: str
    overall_sentiment: str
    articles: List[NewsItem]
    conflicting_reports: bool
    summary: str

class RiskOutput(BaseModel):
    ticker: str
    historical_volatility: Optional[float]
    max_drawdown_pct: Optional[float]
    financial_risks: List[str]
    conflicting_findings: List[str]
    missing_or_outdated_data: List[str]
    risk_level: str  # "Low", "Moderate", "High"
    summary: str