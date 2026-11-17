import operator
from typing import Annotated, Any, Dict, List, Optional, TypedDict


class ResearchState(TypedDict):
    research_id: str
    symbol: str
    company_name: str
    
    # Ingested Market Data
    raw_overview: Dict[str, Any]
    raw_financials: Dict[str, Any]
    raw_ohlcv: List[Dict[str, Any]]
    raw_news: List[Dict[str, Any]]
    
    # Worker Agent Output Payloads
    fundamental_analysis: Optional[Dict[str, Any]]
    technical_analysis: Optional[Dict[str, Any]]
    sentiment_analysis: Optional[Dict[str, Any]]
    
    # Risk and Synthesis
    risk_analysis: Optional[Dict[str, Any]]
    overall_rating: Optional[str]
    confidence_score: Optional[float]
    executive_summary: Optional[str]
    
    # Telemetry and Execution Logs with operator.add reducer for concurrent graph updates
    execution_logs: Annotated[List[Dict[str, Any]], operator.add]
    errors: Annotated[List[str], operator.add]
