import pandas as pd
from typing import List, Dict, Any
from .schemas import RiskOutput, FundamentalOutput, TechnicalOutput, NewsOutput

def run_risk_agent(
    ticker: str,
    ohlcv_data: List[Dict[str, Any]],
    fundamental: FundamentalOutput,
    technical: TechnicalOutput,
    news: NewsOutput
) -> RiskOutput:
    max_drawdown = None
    if ohlcv_data:
        df = pd.DataFrame(ohlcv_data)
        prices = pd.to_numeric(df["Close"], errors="coerce").dropna()
        if len(prices) > 1:
            rolling_max = prices.cummax()
            drawdown = (prices - rolling_max) / rolling_max
            max_drawdown = round(float(drawdown.min() * 100), 2)

    financial_risks = []
    if "High Leverage" in fundamental.debt_status:
        financial_risks.append("High debt-to-equity ratio increases financial risk.")
    if "Loss-making" in fundamental.profitability_status:
        financial_risks.append("Company is currently unprofitable.")

    # Detect conflicting findings across agents
    conflicts = []
    if technical.trend_signal == "Upward" and ("Declining" in fundamental.revenue_trend or "High Leverage" in fundamental.debt_status):
        conflicts.append("Technical trend is upward, but fundamentals show declining revenue or high debt.")
    if technical.trend_signal == "Downward" and news.overall_sentiment == "Positive":
        conflicts.append("News sentiment is positive, but stock price trend is downward.")
    if news.conflicting_reports:
        conflicts.append("Recent financial news contains conflicting positive and negative reports.")

    missing = list(fundamental.missing_data)
    if news.overall_sentiment == "Unavailable":
        missing.append("Recent News")

    # Risk level classification
    vol = technical.historical_volatility or 0
    if vol > 35 or (max_drawdown is not None and max_drawdown < -25) or len(financial_risks) >= 2:
        risk_level = "High"
    elif vol > 20 or len(conflicts) > 0:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    summary = (
        f"Overall risk for {ticker} is {risk_level}. "
        f"Max drawdown: {max_drawdown}%, Volatility: {technical.historical_volatility}%. "
        f"Detected {len(conflicts)} conflicting finding(s) across agents."
    )

    return RiskOutput(
        ticker=ticker,
        historical_volatility=technical.historical_volatility,
        max_drawdown_pct=max_drawdown,
        financial_risks=financial_risks,
        conflicting_findings=conflicts,
        missing_or_outdated_data=missing,
        risk_level=risk_level,
        summary=summary
    )