from typing import Any, Dict
from langgraph.graph import StateGraph, START, END
from app.agents.fundamental_agent import FundamentalAnalysisAgent
from app.agents.news_agent import NewsSentimentAgent
from app.agents.risk_agent import RiskAnalysisAgent
from app.agents.state import ResearchState
from app.agents.supervisor import SupervisorAgent
from app.agents.technical_agent import TechnicalAnalysisAgent


async def supervisor_plan_node(state: ResearchState) -> Dict[str, Any]:
    """Initial supervisor validation and execution dispatch."""
    return {
        "execution_logs": [{
            "agent": "supervisor",
            "action": "PLAN_INITIALIZED",
            "message": f"Planning multi-agent analysis for {state['symbol']}."
        }]
    }


async def fundamental_node(state: ResearchState) -> Dict[str, Any]:
    result = await FundamentalAnalysisAgent.run(state)
    result["execution_logs"] = [{
        "agent": "fundamental",
        "action": "ANALYSIS_COMPLETE",
        "message": "Fundamental valuation and margin analysis completed."
    }]
    return result


async def technical_node(state: ResearchState) -> Dict[str, Any]:
    result = await TechnicalAnalysisAgent.run(state)
    result["execution_logs"] = [{
        "agent": "technical",
        "action": "ANALYSIS_COMPLETE",
        "message": "Technical moving averages, RSI, and MACD indicators computed."
    }]
    return result


async def news_node(state: ResearchState) -> Dict[str, Any]:
    result = await NewsSentimentAgent.run(state)
    result["execution_logs"] = [{
        "agent": "news",
        "action": "ANALYSIS_COMPLETE",
        "message": "Corporate news and sentiment polarity evaluated."
    }]
    return result


async def risk_node(state: ResearchState) -> Dict[str, Any]:
    result = await RiskAnalysisAgent.run(state)
    result["execution_logs"] = [{
        "agent": "risk",
        "action": "AUDIT_COMPLETE",
        "message": "Cross-domain contradiction and downside risk audit finalized."
    }]
    return result


async def supervisor_synthesis_node(state: ResearchState) -> Dict[str, Any]:
    result = await SupervisorAgent.synthesize(state)
    result["execution_logs"] = [{
        "agent": "supervisor",
        "action": "SYNTHESIS_COMPLETE",
        "message": f"Synthesized unified outlook: {result.get('overall_rating')}."
    }]
    return result


def create_research_graph():
    """Builds and compiles the multi-agent LangGraph workflow."""
    workflow = StateGraph(ResearchState)

    # Add agent nodes
    workflow.add_node("supervisor_plan", supervisor_plan_node)
    workflow.add_node("fundamental_agent", fundamental_node)
    workflow.add_node("technical_agent", technical_node)
    workflow.add_node("news_agent", news_node)
    workflow.add_node("risk_agent", risk_node)
    workflow.add_node("supervisor_synthesis", supervisor_synthesis_node)

    # Edges: START -> Supervisor Plan
    workflow.add_edge(START, "supervisor_plan")

    # Supervisor dispatches 3 workers in parallel
    workflow.add_edge("supervisor_plan", "fundamental_agent")
    workflow.add_edge("supervisor_plan", "technical_agent")
    workflow.add_edge("supervisor_plan", "news_agent")

    # All 3 workers feed into the Risk Analysis Agent (Join Barrier)
    workflow.add_edge("fundamental_agent", "risk_agent")
    workflow.add_edge("technical_agent", "risk_agent")
    workflow.add_edge("news_agent", "risk_agent")

    # Risk Agent feeds into Final Supervisor Synthesis
    workflow.add_edge("risk_agent", "supervisor_synthesis")
    workflow.add_edge("supervisor_synthesis", END)

    return workflow.compile()
