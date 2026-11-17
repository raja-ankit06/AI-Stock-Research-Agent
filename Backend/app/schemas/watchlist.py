from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class WatchlistItemCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)


class WatchlistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    watchlist_id: str
    symbol: str
    company_name: Optional[str] = None
    current_price: Optional[float] = None
    change_percent: Optional[float] = None
    added_at: datetime


class WatchlistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class WatchlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    items: List[WatchlistItemResponse] = Field(default_factory=list)
