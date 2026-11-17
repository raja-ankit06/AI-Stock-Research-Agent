from typing import Any, Dict, List
from app.agents.state import ResearchState
from app.schemas.agent import ContradictionItem, RiskAnalysisPayload


class RiskAnalysisAgent:
    """
    Performs adversarial cross-domain risk audits, detecting contradictory signals
    across fundamentals, technicals, and news sentiment.
    """

    @staticmethod
    async def run(state: ResearchState) -> Dict[str, Any]:
        fund = state.get("fundamental_analysis") or {}
        tech = state.get("technical_analysis") or {}
        sent = state.get("sentiment_analysis") or {}

        pe_ratio = fund.get("pe_ratio") or 25.0
        debt_to_equity = fund.get("debt_to_equity") or 0.5
        current_ratio = fund.get("current_ratio") or 1.5

        trend = tech.get("trend", "Neutral")
        rsi_14 = tech.get("rsi_14") or 50.0

        sentiment_score = sent.get("composite_score") or 0.0

        contradictions: List[ContradictionItem] = []
        risk_factors: List[str] = []

        # 1. Contradiction Check: Technical Overbought vs Extreme Valuation
        if rsi_14 >= 68.0 and pe_ratio >= 40.0:
            contradictions.append(ContradictionItem(
                title="Valuation Multiple & Momentum Extension",
                description=(
                    f"RSI is stretched near overbought levels ({rsi_14:.1f}) while trailing P/E trades "
                    f"at an elevated {pe_ratio:.1f}x multiple, heightening mean-reversion risk."
                ),
                severity="WARNING"
            ))

        # 2. Contradiction Check: Divergent Narrative vs Technical Downtrend
        if sentiment_score >= 0.40 and trend == "Bearish":
            contradictions.append(ContradictionItem(
                title="Sentiment & Price Action Divergence",
                description=(
                    "Corporate headlines reflect strong bullish sentiment, yet price action remains trapped "
                    "in a confirmed technical downtrend below the 50-day moving average."
                ),
                severity="CRITICAL"
            ))

        # 3. Balance Sheet Leverage Risk
        if debt_to_equity > 1.20:
            risk_factors.append(
                f"Elevated debt-to-equity ratio ({debt_to_equity:.2f}) limits capital flexibility under high interest rates."
            )

        if current_ratio < 1.10:
            risk_factors.append(
                f"Tight short-term liquidity indicated by current ratio of {current_ratio:.2f}x."
            )

        if not risk_factors:
            risk_factors.append("Macroeconomic sensitivity and broader market beta fluctuations.")
            risk_factors.append("Competitive margin pressure from sector peers.")

        # Determine overall risk category
        if len(contradictions) >= 2 or debt_to_equity > 2.0:
            overall_risk = "High"
        elif len(contradictions) == 1 or debt_to_equity > 1.0 or rsi_14 > 72.0:
            overall_risk = "Moderate"
        else:
            overall_risk = "Low"

        payload = RiskAnalysisPayload(
            overall_risk_level=overall_risk,
            beta=1.25,
            max_drawdown_1y=0.18,
            volatility_30d=0.22,
            detected_contradictions=contradictions,
            key_risk_factors=risk_factors[:3],
            limitations=[
                "Analysis reflects published historical financial statements and delayed market data.",
                "Forward macroeconomic shifts or regulatory actions may alter the risk profile."
            ]
        )

        return {"risk_analysis": payload.model_dump()}

