from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.watchlist import Watchlist, WatchlistItem
from app.schemas.watchlist import (
    WatchlistCreate,
    WatchlistItemCreate,
    WatchlistItemResponse,
    WatchlistResponse,
)
from app.services.market_data_service import get_market_data_provider

router = APIRouter()


@router.get("", response_model=list[WatchlistResponse])
async def list_watchlists(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all watchlists created by authenticated user."""
    stmt = (
        select(Watchlist)
        .options(selectinload(Watchlist.items))
        .where(Watchlist.user_id == current_user.id)
        .order_by(Watchlist.created_at)
    )
    res = await db.execute(stmt)
    watchlists = res.scalars().all()

    provider = get_market_data_provider()
    response_list = []

    for wl in watchlists:
        item_responses = []
        for item in wl.items:
            # Fetch latest price for watchlist display
            overview = await provider.get_overview(item.symbol)
            price = overview.current_price if overview else None
            change = overview.change_percent if overview else None
            name = overview.company_name if overview else item.company_name

            item_responses.append(WatchlistItemResponse(
                id=item.id,
                watchlist_id=item.watchlist_id,
                symbol=item.symbol,
                company_name=name,
                current_price=price,
                change_percent=change,
                added_at=item.added_at
            ))

        response_list.append(WatchlistResponse(
            id=wl.id,
            name=wl.name,
            description=wl.description,
            created_at=wl.created_at,
            items=item_responses
        ))

    return response_list


@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
async def create_watchlist(
    request: WatchlistCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new custom watchlist."""
    wl = Watchlist(
        user_id=current_user.id,
        name=request.name,
        description=request.description
    )
    db.add(wl)
    await db.commit()
    await db.refresh(wl)
    return WatchlistResponse(
        id=wl.id,
        name=wl.name,
        description=wl.description,
        created_at=wl.created_at,
        items=[]
    )


@router.delete("/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_watchlist(
    watchlist_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a watchlist."""
    stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == current_user.id)
    res = await db.execute(stmt)
    wl = res.scalar_one_or_none()

    if not wl:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found."
        )

    await db.delete(wl)
    await db.commit()


@router.post("/{watchlist_id}/stocks", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_stock_to_watchlist(
    watchlist_id: str,
    request: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a stock ticker to a watchlist."""
    stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == current_user.id)
    res = await db.execute(stmt)
    wl = res.scalar_one_or_none()

    if not wl:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found."
        )

    symbol_clean = request.symbol.strip().upper()

    # Check if stock is already present
    item_stmt = select(WatchlistItem).where(
        WatchlistItem.watchlist_id == watchlist_id,
        WatchlistItem.symbol == symbol_clean
    )
    existing_item = (await db.execute(item_stmt)).scalar_one_or_none()
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Stock '{symbol_clean}' is already in this watchlist."
        )

    provider = get_market_data_provider()
    overview = await provider.get_overview(symbol_clean)
    name = overview.company_name if overview else symbol_clean

    item = WatchlistItem(
        watchlist_id=watchlist_id,
        symbol=symbol_clean,
        company_name=name
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return WatchlistItemResponse(
        id=item.id,
        watchlist_id=item.watchlist_id,
        symbol=item.symbol,
        company_name=name,
        current_price=overview.current_price if overview else None,
        change_percent=overview.change_percent if overview else None,
        added_at=item.added_at
    )


@router.delete("/{watchlist_id}/stocks/{symbol}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_stock_from_watchlist(
    watchlist_id: str,
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a stock ticker from a watchlist."""
    symbol_clean = symbol.strip().upper()
    # Verify watchlist ownership
    wl_stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == current_user.id)
    wl = (await db.execute(wl_stmt)).scalar_one_or_none()
    if not wl:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found."
        )

    item_stmt = select(WatchlistItem).where(
        WatchlistItem.watchlist_id == watchlist_id,
        WatchlistItem.symbol == symbol_clean
    )
    item = (await db.execute(item_stmt)).scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock '{symbol_clean}' not found in watchlist."
        )

    await db.delete(item)
    await db.commit()

