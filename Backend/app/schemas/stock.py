from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class StockSearchResult(BaseModel):
    symbol: str
    company_name: str
    exchange: str
    asset_type: str = "Common Stock"
    currency: str = "USD"
    market: str = "US"  # US, IN, GLOBAL


class StockSearchResponse(BaseModel):
    query: str
    count: int
    results: List[StockSearchResult]


class StockOverview(BaseModel):
    symbol: str
    company_name: str
    exchange: str
    currency: str = "USD"
    current_price: float
    change_amount: float
    change_percent: float
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None
    volume: Optional[int] = None
    source: str
    timestamp: str


class OHLCVPoint(BaseModel):
    time: str  # YYYY-MM-DD
    open: float
    high: float
    low: float
    close: float
    volume: int


class OHLCVResponse(BaseModel):
    symbol: str
    timeframe: str
    data_points: int
    series: List[OHLCVPoint]


class FinancialMetrics(BaseModel):
    symbol: str
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_to_ebitda: Optional[float] = None
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    net_margin: Optional[float] = None
    roe: Optional[float] = None
    current_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    free_cash_flow: Optional[float] = None
    revenue_growth_yoy: Optional[float] = None
    timestamp: str

