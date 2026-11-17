import numpy as np
import pandas as pd
import pytest
from app.services.technical_calc_service import TechnicalCalcService


def test_calculate_indicators_empty():
    df = pd.DataFrame()
    res = TechnicalCalcService.calculate_indicators(df)
    assert res["trend"] == "Neutral"
    assert res["sma_20"] is None


def test_calculate_indicators_real_data():
    # Construct 100 days of ascending price series
    data = []
    base_price = 100.0
    for i in range(100):
        close_p = base_price + i * 0.5
        data.append({
            "open": close_p - 0.2,
            "high": close_p + 0.5,
            "low": close_p - 0.5,
            "close": close_p,
            "volume": 1000000 + i * 1000
        })
    df = pd.DataFrame(data)

    res = TechnicalCalcService.calculate_indicators(df)

    assert res["trend"] == "Bullish"
    assert res["sma_20"] is not None
    assert res["sma_50"] is not None
    assert res["rsi_14"] is not None
    assert res["rsi_14"] > 50  # Strongly trending upward
    assert res["macd_status"] in ["Bullish Crossover", "Bullish Momentum"]
    assert res["support_level"] <= res["resistance_level"]
    assert res["volatility_30d"] is not None
    assert res["max_drawdown_1y"] is not None
