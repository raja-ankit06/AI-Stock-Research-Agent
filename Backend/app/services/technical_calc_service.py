from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd


class TechnicalCalcService:
    """
    Deterministic mathematical indicator calculation engine.
    Uses numpy and pandas exclusively with zero LLM dependence.
    """

    @staticmethod
    def calculate_indicators(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculates SMA, EMA, RSI, MACD, Bollinger Bands, Support/Resistance,
        volatility, and Maximum Drawdown from an OHLCV DataFrame.
        Expected columns: ['open', 'high', 'low', 'close', 'volume']
        """
        if df.empty or len(df) < 5:
            return {
                "trend": "Neutral",
                "sma_20": None,
                "sma_50": None,
                "sma_200": None,
                "rsi_14": None,
                "macd_status": "Neutral",
                "bollinger_position": "Mid-Range",
                "support_level": None,
                "resistance_level": None,
                "volatility_30d": None,
                "max_drawdown_1y": None,
                "momentum_summary": "Insufficient historical data to compute technical indicators."
            }

        close = df["close"].astype(float)
        high = df["high"].astype(float)
        low = df["low"].astype(float)

        # 1. Simple Moving Averages (SMA)
        sma_20 = float(close.rolling(window=20).mean().iloc[-1]) if len(close) >= 20 else float(close.mean())
        sma_50 = float(close.rolling(window=50).mean().iloc[-1]) if len(close) >= 50 else float(close.mean())
        sma_200 = float(close.rolling(window=200).mean().iloc[-1]) if len(close) >= 200 else float(close.mean())

        # 2. Exponential Moving Averages (EMA)
        ema_12 = close.ewm(span=12, adjust=False).mean()
        ema_26 = close.ewm(span=26, adjust=False).mean()

        # 3. MACD (Moving Average Convergence Divergence)
        macd_line = ema_12 - ema_26
        macd_signal = macd_line.ewm(span=9, adjust=False).mean()
        macd_hist = macd_line - macd_signal

        curr_macd = float(macd_line.iloc[-1])
        curr_signal = float(macd_signal.iloc[-1])
        prev_macd = float(macd_line.iloc[-2]) if len(macd_line) > 1 else curr_macd
        prev_signal = float(macd_signal.iloc[-2]) if len(macd_signal) > 1 else curr_signal

        if curr_macd > curr_signal and prev_macd <= prev_signal:
            macd_status = "Bullish Crossover"
        elif curr_macd > curr_signal:
            macd_status = "Bullish Momentum"
        elif curr_macd < curr_signal and prev_macd >= prev_signal:
            macd_status = "Bearish Crossover"
        else:
            macd_status = "Bearish Momentum"

        # 4. Relative Strength Index (RSI - 14 period)
        delta = close.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        
        avg_gain = gain.rolling(window=14, min_periods=14).mean()
        avg_loss = loss.rolling(window=14, min_periods=14).mean()
        
        # Exponential smoothing for RSI (Wilder's method)
        if len(close) >= 15 and not avg_loss.dropna().empty:
            last_avg_loss = avg_loss.iloc[-1]
            last_avg_gain = avg_gain.iloc[-1]
            if last_avg_loss == 0 or np.isnan(last_avg_loss):
                rsi_14 = 100.0 if last_avg_gain > 0 else 50.0
            else:
                rs = last_avg_gain / last_avg_loss
                rsi_14 = float(100.0 - (100.0 / (1.0 + rs)))
        else:
            rsi_14 = 50.0  # Default neutral if insufficient periods

        # 5. Bollinger Bands (20 period, 2 std dev)
        rolling_std_20 = float(close.rolling(window=20).std().iloc[-1]) if len(close) >= 20 else float(close.std())
        if np.isnan(rolling_std_20):
            rolling_std_20 = float(close.std()) if not np.isnan(close.std()) else 1.0

        bb_upper = sma_20 + (2.0 * rolling_std_20)
        bb_lower = sma_20 - (2.0 * rolling_std_20)
        curr_price = float(close.iloc[-1])

        if curr_price >= bb_upper:
            bollinger_pos = "Near Upper Band (Overbought Setup)"
        elif curr_price <= bb_lower:
            bollinger_pos = "Near Lower Band (Oversold Setup)"
        else:
            bollinger_pos = "Mid-Range (Consolidation)"

        # 6. Support and Resistance (Swing high/low & Pivot levels)
        recent_window = min(len(df), 60)
        recent_highs = high.iloc[-recent_window:]
        recent_lows = low.iloc[-recent_window:]
        
        resistance_level = float(recent_highs.max())
        support_level = float(recent_lows.min())

        # 7. Trend Determination
        if curr_price > sma_50 and sma_20 > sma_50 and rsi_14 > 50:
            trend = "Bullish"
        elif curr_price < sma_50 and sma_20 < sma_50 and rsi_14 < 50:
            trend = "Bearish"
        else:
            trend = "Neutral"

        # 8. 30-Day Volatility & 1-Year Max Drawdown
        daily_returns = close.pct_change().dropna()
        if len(daily_returns) >= 20:
            volatility_30d = float(daily_returns.tail(30).std() * np.sqrt(252))
        else:
            volatility_30d = float(daily_returns.std() * np.sqrt(252)) if not daily_returns.empty else 0.20

        # Maximum Drawdown calculation
        cumulative_max = close.cummax()
        drawdowns = (close - cumulative_max) / cumulative_max
        max_drawdown = float(abs(drawdowns.min())) if not drawdowns.empty else 0.15

        # 9. Deterministic Momentum Summary
        momentum_summary = (
            f"The asset exhibits a {trend.upper()} trend. Price (${curr_price:.2f}) trades "
            f"{'above' if curr_price > sma_50 else 'below'} the 50-day SMA (${sma_50:.2f}) with RSI at {rsi_14:.1f}. "
            f"MACD indicates {macd_status}. Key support is identified at ${support_level:.2f} and resistance at ${resistance_level:.2f}."
        )

        return {
            "trend": trend,
            "sma_20": round(sma_20, 2),
            "sma_50": round(sma_50, 2),
            "sma_200": round(sma_200, 2),
            "rsi_14": round(rsi_14, 1),
            "macd_status": macd_status,
            "bollinger_position": bollinger_pos,
            "support_level": round(support_level, 2),
            "resistance_level": round(resistance_level, 2),
            "volatility_30d": round(volatility_30d, 4),
            "max_drawdown_1y": round(max_drawdown, 4),
            "momentum_summary": momentum_summary
        }

