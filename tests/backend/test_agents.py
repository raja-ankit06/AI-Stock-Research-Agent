import pytest
from app.agents.graph import create_research_graph
from app.agents.state import ResearchState


@pytest.mark.asyncio
async def test_langgraph_research_pipeline():
    graph = create_research_graph()

    state: ResearchState = {
        "research_id": "test-res-123",
        "symbol": "NVDA",
        "company_name": "NVIDIA Corporation",
        "raw_overview": {
            "current_price": 142.50,
            "pe_ratio": 48.0,
            "change_percent": 2.5
        },
        "raw_financials": {
            "pe_ratio": 48.0,
            "gross_margin": 0.75,
            "operating_margin": 0.62,
            "debt_to_equity": 0.41,
            "current_ratio": 3.5
        },
        "raw_ohlcv": [
            {"time": "2026-11-10", "open": 140.0, "high": 143.0, "low": 139.5, "close": 142.5, "volume": 35000000},
            {"time": "2026-11-11", "open": 142.5, "high": 144.0, "low": 141.0, "close": 143.2, "volume": 32000000},
            {"time": "2026-11-12", "open": 143.0, "high": 145.0, "low": 142.0, "close": 144.5, "volume": 38000000},
            {"time": "2026-11-13", "open": 144.5, "high": 146.0, "low": 143.5, "close": 145.0, "volume": 41000000},
            {"time": "2026-11-14", "open": 145.0, "high": 147.0, "low": 144.0, "close": 146.2, "volume": 45000000},
        ],
        "raw_news": [
            {
                "headline": "NVIDIA Blackwell chips ramp up with massive cloud provider demand",
                "publisher": "Tech Daily",
                "published_at": "Today",
                "summary": "Hyperscalers are ordering record quantities of next-generation AI GPUs."
            }
        ],
        "fundamental_analysis": None,
        "technical_analysis": None,
        "sentiment_analysis": None,
        "risk_analysis": None,
        "overall_rating": None,
        "confidence_score": None,
        "executive_summary": None,
        "execution_logs": [],
        "errors": []
    }

    final_state = await graph.ainvoke(state)

    assert final_state["fundamental_analysis"] is not None
    assert final_state["technical_analysis"] is not None
    assert final_state["sentiment_analysis"] is not None
    assert final_state["risk_analysis"] is not None
    assert final_state["overall_rating"] in ["Bullish", "Cautiously Bullish", "Neutral", "Cautiously Bearish", "Bearish"]
    assert final_state["confidence_score"] > 0.5
    assert len(final_state["executive_summary"]) > 20
    assert len(final_state["execution_logs"]) >= 5
