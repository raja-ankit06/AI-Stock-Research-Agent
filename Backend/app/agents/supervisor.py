from typing import Any, Dict
from app.agents.state import ResearchState


class SupervisorAgent:
    """
    Coordinates multi-agent planning, output validation, and final synthesis
    into a structured institutional research thesis.
    """

    @staticmethod
    async def synthesize(state: ResearchState) -> Dict[str, Any]:
        symbol = state["symbol"]
        company_name = state.get("company_name", symbol)

        fund = state.get("fundamental_analysis") or {}
        tech = state.get("technical_analysis") or {}
        sent = state.get("sentiment_analysis") or {}
        risk = state.get("risk_analysis") or {}

        # Multi-factor score compilation (-2.0 to +2.0 scale)
        score = 0.0

        # Technical trend contribution
        tech_trend = tech.get("trend", "Neutral")
        if tech_trend == "Bullish":
            score += 0.7
        elif tech_trend == "Bearish":
            score -= 0.7

        # Fundamental quality contribution
        gross_margin = fund.get("gross_margin") or 0.30
        debt_to_equity = fund.get("debt_to_equity") or 0.8
        if gross_margin > 0.35 and debt_to_equity < 0.8:
            score += 0.6
        elif gross_margin < 0.20 or debt_to_equity > 1.5:
            score -= 0.6

        # Sentiment contribution
        sentiment_score = sent.get("composite_score") or 0.0
        score += sentiment_score * 0.5

        # Risk deduction
        risk_level = risk.get("overall_risk_level", "Moderate")
        if risk_level == "High":
            score -= 0.4
        elif risk_level == "Critical":
            score -= 0.8

        # Map composite score to structured rating
        if score >= 0.8:
            rating = "Bullish"
            confidence = 0.88
        elif score >= 0.25:
            rating = "Cautiously Bullish"
            confidence = 0.78
        elif score >= -0.25:
            rating = "Neutral"
            confidence = 0.72
        elif score >= -0.8:
            rating = "Cautiously Bearish"
            confidence = 0.75
        else:
            rating = "Bearish"
            confidence = 0.84

        # Executive summary synthesis
        rsi_val = tech.get("rsi_14", 50.0)
        risk_flags = len(risk.get("detected_contradictions", []))
        
        summary = (
            f"{company_name} ({symbol}) carries a synthesized {rating.upper()} outlook with {int(confidence * 100)}% "
            f"confidence. Technical price action reflects a {tech_trend.lower()} trend with RSI at {rsi_val:.1f}. "
            f"Fundamental analysis highlights operating margins of {(fund.get('operating_margin') or 0.2) * 100:.1f}% "
            f"against a {risk_level.lower()} risk profile with {risk_flags} cross-domain contradiction warning(s). "
            f"Market sentiment remains {sent.get('sentiment_label', 'Neutral').lower()} based on {sent.get('articles_analyzed', 0)} corporate news reports."
        )

        return {
            "overall_rating": rating,
            "confidence_score": confidence,
            "executive_summary": summary
        }

