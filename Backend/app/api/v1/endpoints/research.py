import asyncio
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.deps import get_current_user
from app.core.database import AsyncSessionLocal, get_db
from app.models.research import ResearchReport, ResearchSession
from app.models.user import User
from app.schemas.research import (
    CreateResearchRequest,
    ResearchListItem,
    ResearchListResponse,
    ResearchSessionResponse,
)
from app.services.research_orchestrator import get_research_orchestrator

router = APIRouter()


async def run_pipeline_in_background(session_id: str, symbol: str, user_id: str):
    """Run research pipeline with independent async DB session."""
    async with AsyncSessionLocal() as session:
        orchestrator = get_research_orchestrator()
        await orchestrator.execute_research(session_id, symbol, user_id, session)


@router.post("", response_model=ResearchSessionResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_research_session(
    request: CreateResearchRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Initiate an asynchronous LangGraph multi-agent research workflow."""
    symbol_clean = request.symbol.strip().upper()

    session = ResearchSession(
        user_id=current_user.id,
        symbol=symbol_clean,
        status="PENDING"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Launch multi-agent execution pipeline in background task
    background_tasks.add_task(
        run_pipeline_in_background,
        session.id,
        symbol_clean,
        current_user.id
    )

    return ResearchSessionResponse(
        research_id=session.id,
        symbol=symbol_clean,
        company_name=symbol_clean,
        status="PENDING",
        created_at=session.created_at,
        stream_url=f"/api/v1/research/{session.id}/stream"
    )


@router.get("/{research_id}/stream")
async def stream_research_progress(
    research_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Stream real-time multi-agent execution events via Server-Sent Events (SSE)."""
    stmt = select(ResearchSession).where(ResearchSession.id == research_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research session not found."
        )

    orchestrator = get_research_orchestrator()
    return StreamingResponse(
        orchestrator.stream_events(research_id),
        media_type="text/event-stream"
    )


@router.get("", response_model=ResearchListResponse)
async def list_research_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    symbol: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List authenticated user's research history."""
    query = select(ResearchSession).options(selectinload(ResearchSession.report)).where(
        ResearchSession.user_id == current_user.id
    )
    if symbol:
        query = query.where(ResearchSession.symbol == symbol.strip().upper())

    count_query = select(func.count(ResearchSession.id)).where(ResearchSession.user_id == current_user.id)
    if symbol:
        count_query = count_query.where(ResearchSession.symbol == symbol.strip().upper())

    total_count = await db.scalar(count_query) or 0

    query = query.order_by(desc(ResearchSession.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    sessions = result.scalars().all()

    items = []
    for s in sessions:
        rating = s.report.overall_rating if s.report else None
        conf = s.report.confidence_score if s.report else None
        items.append(ResearchListItem(
            research_id=s.id,
            symbol=s.symbol,
            company_name=s.company_name or s.symbol,
            rating=rating,
            confidence_score=conf,
            status=s.status,
            duration_seconds=s.duration_seconds,
            created_at=s.created_at
        ))

    return ResearchListResponse(
        items=items,
        total=total_count,
        page=page,
        page_size=page_size
    )


@router.get("/{research_id}")
async def get_research_session(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get research session details and associated report id."""
    stmt = (
        select(ResearchSession)
        .options(selectinload(ResearchSession.report))
        .where(ResearchSession.id == research_id, ResearchSession.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research session not found."
        )

    return {
        "research_id": session.id,
        "symbol": session.symbol,
        "company_name": session.company_name,
        "status": session.status,
        "duration_seconds": session.duration_seconds,
        "report_id": session.report.id if session.report else None,
        "created_at": session.created_at
    }


@router.delete("/{research_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_research_session(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a research session from history."""
    stmt = select(ResearchSession).where(
        ResearchSession.id == research_id,
        ResearchSession.user_id == current_user.id
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research session not found."
        )

    await db.delete(session)
    await db.commit()

