import pandas as pd
import numpy as np
from typing import List, Dict, Any
from .schemas import TechnicalOutput

def run_technical_agent(ticker: str, ohlcv_data: List[Dict[str, Any]]) -> TechnicalOutput:
    if not ohlcv_data or len(ohlcv_data) < 26:
        return TechnicalOutput(
            ticker=ticker, latest_close=None, sma_20=None, ema_20=None,
            rsi_14=None, macd=None, macd_signal=None, historical_volatility=None,
            trend_signal="Insufficient Data", chart_data=[],
            summary="Not enough historical price data to compute technical indicators."
        )

    df = pd.DataFrame(ohlcv_data)
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")
    df = df.dropna(subset=["Close"]).reset_index(drop=True)

    # 1. SMA & EMA (20-period)
    df["SMA_20"] = df["Close"].rolling(window=20).mean()
    df["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()

    # 2. RSI (14-period)
    delta = df["Close"].diff()
    gain = delta.clip(lower=0).rolling(window=14).mean()
    loss = (-delta.clip(upper=0)).rolling(window=14).mean()
    rs = gain / loss.replace(0, np.nan)
    df["RSI_14"] = 100 - (100 / (1 + rs))

    # 3. MACD (12, 26, 9)
    ema_12 = df["Close"].ewm(span=12, adjust=False).mean()
    ema_26 = df["Close"].ewm(span=26, adjust=False).mean()
    df["MACD"] = ema_12 - ema_26
    df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()

    # 4. Annualized Historical Volatility
    returns = df["Close"].pct_change().dropna()
    volatility = float(returns.std() * np.sqrt(252) * 100) if len(returns) > 1 else None

    latest = df.iloc[-1]
    close_val = round(float(latest["Close"]), 2)
    sma_val = round(float(latest["SMA_20"]), 2) if pd.notna(latest["SMA_20"]) else None
    ema_val = round(float(latest["EMA_20"]), 2) if pd.notna(latest["EMA_20"]) else None
    rsi_val = round(float(latest["RSI_14"]), 2) if pd.notna(latest["RSI_14"]) else None
    macd_val = round(float(latest["MACD"]), 2) if pd.notna(latest["MACD"]) else None
    sig_val = round(float(latest["MACD_Signal"]), 2) if pd.notna(latest["MACD_Signal"]) else None

    # Trend signal logic
    if sma_val and close_val > sma_val and macd_val is not None and sig_val is not None and macd_val > sig_val:
        trend = "Upward"
    elif sma_val and close_val < sma_val and macd_val is not None and sig_val is not None and macd_val < sig_val:
        trend = "Downward"
    else:
        trend = "Mixed"

    # Last 30 days data for frontend charts
    chart_df = df.tail(30)[["trading_date", "Close", "SMA_20", "EMA_20", "RSI_14"]].fillna(0)
    chart_data = chart_df.to_dict(orient="records")

    summary = (
        f"{ticker} closed at {close_val}. Technical indicators suggest a {trend.lower()} trend "
        f"(SMA20: {sma_val}, RSI14: {rsi_val}, MACD: {macd_val}). "
        f"Note: Indicators reflect historical data, not guaranteed future predictions."
    )

    return TechnicalOutput(
        ticker=ticker,
        latest_close=close_val,
        sma_20=sma_val,
        ema_20=ema_val,
        rsi_14=rsi_val,
        macd=macd_val,
        macd_signal=sig_val,
        historical_volatility=round(volatility, 2) if volatility else None,
        trend_signal=trend,
        chart_data=chart_data,
        summary=summary
    )