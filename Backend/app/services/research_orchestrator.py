import asyncio
import json
import time
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.graph import create_research_graph
from app.agents.state import ResearchState
from app.models.research import AgentExecutionRecord, ResearchReport, ResearchSession
from app.schemas.agent import AgentStatusEvent
from app.services.market_data_service import get_market_data_provider


class ResearchOrchestrator:
    """
    Manages LangGraph multi-agent pipeline execution, SSE progress streaming,
    and database persistence.
    """

    def __init__(self):
        self._graph = create_research_graph()
        # Session stream queues: session_id -> asyncio.Queue
        self._queues: Dict[str, asyncio.Queue] = {}

    def get_or_create_queue(self, session_id: str) -> asyncio.Queue:
        if session_id not in self._queues:
            self._queues[session_id] = asyncio.Queue()
        return self._queues[session_id]

    async def emit_event(self, session_id: str, step: str, agent: str, progress: int, status: str, message: str):
        queue = self.get_or_create_queue(session_id)
        event = AgentStatusEvent(
            step=step,
            agent=agent,
            progress=progress,
            status=status,
            message=message
        )
        await queue.put(event)

    async def execute_research(self, session_id: str, symbol: str, user_id: str, db: AsyncSession):
        start_time = time.time()
        provider = get_market_data_provider()

        try:
            # 1. Update session status to RUNNING
            stmt = select(ResearchSession).where(ResearchSession.id == session_id)
            res = await db.execute(stmt)
            session = res.scalar_one_or_none()
            if session:
                session.status = "RUNNING"
                await db.commit()

            await self.emit_event(
                session_id, "INIT", "supervisor", 5, "RUNNING",
                f"Initializing multi-agent research pipeline for {symbol}."
            )

            # 2. Ingest Market Data
            await self.emit_event(
                session_id, "DATA_INGESTION", "market_gateway", 15, "RUNNING",
                "Retrieving live quotes, financial statements, and historical price action."
            )
            overview = await provider.get_overview(symbol)
            company_name = overview.company_name if overview else symbol
            ohlcv = await provider.get_historical_ohlcv(symbol, "1Y")
            financials = await provider.get_financials(symbol)
            news = await provider.get_news(symbol, 15)

            if session:
                session.company_name = company_name
                await db.commit()

            await self.emit_event(
                session_id, "DATA_INGESTION", "market_gateway", 25, "COMPLETED",
                f"Ingested 1Y OHLCV candles, balance sheets, and {len(news)} news articles."
            )

            # 3. Prepare initial state for LangGraph
            initial_state: ResearchState = {
                "research_id": session_id,
                "symbol": symbol,
                "company_name": company_name,
                "raw_overview": overview.model_dump() if overview else {},
                "raw_financials": financials,
                "raw_ohlcv": [p.model_dump() for p in ohlcv],
                "raw_news": news,
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

            # 4. Stream simulated agent execution progress while invoking the graph
            await self.emit_event(
                session_id, "FUNDAMENTAL", "fundamental", 40, "RUNNING",
                "Fundamental Agent analyzing operating margins, balance sheet leverage, and P/E ratios."
            )
            await self.emit_event(
                session_id, "TECHNICAL", "technical", 60, "RUNNING",
                "Technical Agent calculating SMA 20/50/200, 14-period RSI, MACD, and Bollinger Bands."
            )
            await self.emit_event(
                session_id, "NEWS", "news", 75, "RUNNING",
                "News Agent evaluating article polarity, sentiment shifts, and corporate catalysts."
            )

            # Run LangGraph pipeline
            final_state = await self._graph.ainvoke(initial_state)

            await self.emit_event(
                session_id, "RISK", "risk", 90, "RUNNING",
                "Risk Agent conducting adversarial cross-domain contradiction and downside volatility audit."
            )

            duration = round(time.time() - start_time, 2)

            # 5. Persist ResearchReport to database
            report = ResearchReport(
                research_session_id=session_id,
                symbol=symbol,
                overall_rating=final_state.get("overall_rating") or "Neutral",
                confidence_score=final_state.get("confidence_score") or 0.75,
                executive_summary=final_state.get("executive_summary") or f"Research report for {symbol}",
                fundamental_payload=final_state.get("fundamental_analysis") or {},
                technical_payload=final_state.get("technical_analysis") or {},
                sentiment_payload=final_state.get("sentiment_analysis") or {},
                risk_payload=final_state.get("risk_analysis") or {}
            )
            db.add(report)

            # Update ResearchSession record
            if session:
                session.status = "COMPLETED"
                session.duration_seconds = duration
                session.completed_at = datetime.now(timezone.utc)

            # Save execution logs
            for log in final_state.get("execution_logs", []):
                db.add(AgentExecutionRecord(
                    research_session_id=session_id,
                    agent_name=log.get("agent", "agent"),
                    status="COMPLETED",
                    execution_time_ms=duration * 1000,
                    message=log.get("message", "")
                ))

            await db.commit()

            await self.emit_event(
                session_id, "COMPLETE", "supervisor", 100, "COMPLETED",
                f"Multi-agent research synthesis complete in {duration}s. Report generated."
            )

        except Exception as e:
            duration = round(time.time() - start_time, 2)
            stmt = select(ResearchSession).where(ResearchSession.id == session_id)
            res = await db.execute(stmt)
            session = res.scalar_one_or_none()
            if session:
                session.status = "FAILED"
                session.duration_seconds = duration
                await db.commit()

            await self.emit_event(
                session_id, "ERROR", "supervisor", 100, "FAILED",
                f"Research execution failed: {str(e)}"
            )

    async def stream_events(self, session_id: str) -> AsyncGenerator[str, None]:
        """Generator yielding Server-Sent Events (SSE) for the active research session."""
        queue = self.get_or_create_queue(session_id)
        try:
            while True:
                # Wait for next event with a timeout
                try:
                    event: AgentStatusEvent = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"event: status\ndata: {json.dumps(event.model_dump())}\n\n"
                    if event.progress >= 100:
                        break
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat
                    yield ": ping\n\n"
        finally:
            if session_id in self._queues:
                del self._queues[session_id]


_orchestrator_instance: Optional[ResearchOrchestrator] = None


def get_research_orchestrator() -> ResearchOrchestrator:
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = ResearchOrchestrator()
    return _orchestrator_instance

