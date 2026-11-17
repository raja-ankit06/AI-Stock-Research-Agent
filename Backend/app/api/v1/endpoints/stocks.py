from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.stock import (
    FinancialMetrics,
    OHLCVResponse,
    StockOverview,
    StockSearchResponse,
)
from app.services.market_data_service import get_market_data_provider

router = APIRouter()


@router.get("/search", response_model=StockSearchResponse)
async def search_stocks(
    q: str = Query(..., min_length=1, description="Ticker symbol or company name"),
    limit: int = Query(10, ge=1, le=50)
):
    """Fast stock symbol search with typeahead autocomplete."""
    provider = get_market_data_provider()
    results = await provider.search_stocks(q, limit)
    return StockSearchResponse(
        query=q,
        count=len(results),
        results=results
    )


@router.get("/{symbol}", response_model=StockOverview)
async def get_stock_overview(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Retrieve current stock quote and overview."""
    provider = get_market_data_provider()
    overview = await provider.get_overview(symbol)
    if not overview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock symbol '{symbol}' could not be resolved."
        )
    return overview


@router.get("/{symbol}/history", response_model=OHLCVResponse)
async def get_stock_history(
    symbol: str,
    timeframe: str = Query("1Y", pattern="^(1M|3M|6M|1Y|5Y)$"),
    current_user: User = Depends(get_current_user)
):
    """Retrieve historical daily OHLCV series for charting."""
    provider = get_market_data_provider()
    candles = await provider.get_historical_ohlcv(symbol, timeframe)
    return OHLCVResponse(
        symbol=symbol.upper(),
        timeframe=timeframe,
        data_points=len(candles),
        series=candles
    )


@router.get("/{symbol}/financials", response_model=FinancialMetrics)
async def get_stock_financials(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Retrieve financial statements and valuation ratios."""
    provider = get_market_data_provider()
    data = await provider.get_financials(symbol)
    return FinancialMetrics(
        symbol=symbol.upper(),
        pe_ratio=data.get("pe_ratio"),
        pb_ratio=data.get("pb_ratio"),
        gross_margin=data.get("gross_margin"),
        operating_margin=data.get("operating_margin"),
        net_margin=data.get("net_margin"),
        debt_to_equity=data.get("debt_to_equity"),
        current_ratio=data.get("current_ratio"),
        free_cash_flow=data.get("free_cash_flow"),
        timestamp=data.get("timestamp", "")
    )

