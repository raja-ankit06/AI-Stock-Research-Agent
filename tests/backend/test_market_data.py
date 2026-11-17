import pytest
from app.services.market_data_service import get_market_data_provider


@pytest.mark.asyncio
async def test_stock_search():
    provider = get_market_data_provider()
    results = await provider.search_stocks("NVDA")
    assert len(results) > 0
    symbols = [r.symbol for r in results]
    assert "NVDA" in symbols


@pytest.mark.asyncio
async def test_indian_stock_search():
    provider = get_market_data_provider()
    results = await provider.search_stocks("RELIANCE")
    assert len(results) > 0
    assert any("RELIANCE" in r.symbol for r in results)


@pytest.mark.asyncio
async def test_get_overview():
    provider = get_market_data_provider()
    overview = await provider.get_overview("AAPL")
    assert overview is not None
    assert overview.symbol == "AAPL"
    assert overview.current_price > 0
    assert overview.currency in ["USD", "INR"]


@pytest.mark.asyncio
async def test_get_historical_ohlcv():
    provider = get_market_data_provider()
    candles = await provider.get_historical_ohlcv("AAPL", "1M")
    assert len(candles) > 0
    first_candle = candles[0]
    assert hasattr(first_candle, "open")
    assert hasattr(first_candle, "close")
    assert hasattr(first_candle, "volume")
