from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, UserPreference
from app.schemas.auth import (
    UserPreferenceResponse,
    UserPreferenceUpdate,
    UserResponse,
    UserUpdate,
)

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get active user profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user personal profile."""
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.password is not None:
        current_user.password_hash = get_password_hash(update_data.password)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/preferences", response_model=UserPreferenceResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user workspace preferences."""
    stmt = select(UserPreference).where(UserPreference.user_id == current_user.id)
    result = await db.execute(stmt)
    pref = result.scalar_one_or_none()

    if not pref:
        # Create default preference if missing
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(pref)

    return pref


@router.put("/preferences", response_model=UserPreferenceResponse)
async def update_preferences(
    pref_update: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user workspace preferences."""
    stmt = select(UserPreference).where(UserPreference.user_id == current_user.id)
    result = await db.execute(stmt)
    pref = result.scalar_one_or_none()

    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if pref_update.theme is not None:
        pref.theme = pref_update.theme
    if pref_update.default_market is not None:
        pref.default_market = pref_update.default_market
    if pref_update.default_timeframe is not None:
        pref.default_timeframe = pref_update.default_timeframe
    if pref_update.default_risk_tolerance is not None:
        pref.default_risk_tolerance = pref_update.default_risk_tolerance
    if pref_update.enable_alerts is not None:
        pref.enable_alerts = pref_update.enable_alerts

    await db.commit()
    await db.refresh(pref)
    return pref

