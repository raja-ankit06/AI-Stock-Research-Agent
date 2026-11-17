from typing import Any, Dict
import pandas as pd
from app.agents.state import ResearchState
from app.schemas.agent import TechnicalAnalysisPayload
from app.services.technical_calc_service import TechnicalCalcService


class TechnicalAnalysisAgent:
    """
    Evaluates price action, moving averages, momentum oscillators, and support/resistance
    using deterministic indicator calculations.
    """

    @staticmethod
    async def run(state: ResearchState) -> Dict[str, Any]:
        raw_ohlcv = state.get("raw_ohlcv", [])

        if raw_ohlcv:
            df = pd.DataFrame(raw_ohlcv)
        else:
            df = pd.DataFrame()

        # Compute deterministic technical indicators
        indicators = TechnicalCalcService.calculate_indicators(df)

        payload = TechnicalAnalysisPayload(
            trend=indicators["trend"],
            sma_20=indicators["sma_20"],
            sma_50=indicators["sma_50"],
            sma_200=indicators["sma_200"],
            rsi_14=indicators["rsi_14"],
            macd_status=indicators["macd_status"],
            bollinger_position=indicators["bollinger_position"],
            support_level=indicators["support_level"],
            resistance_level=indicators["resistance_level"],
            momentum_summary=indicators["momentum_summary"]
        )

        return {"technical_analysis": payload.model_dump()}

