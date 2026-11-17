from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.user import RefreshToken, User, UserPreference
from app.models.watchlist import Watchlist
from app.schemas.auth import (
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter()


def _store_refresh_token(db: AsyncSession, user_id: str, refresh_token: str) -> None:
    """Persist a refresh token (hashed) so it can be validated, rotated and revoked later."""
    payload = decode_token(refresh_token) or {}
    exp = payload.get("exp")
    expires_at = (
        datetime.fromtimestamp(exp, tz=timezone.utc)
        if exp
        else datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(RefreshToken(
        user_id=user_id,
        token_hash=hash_token(refresh_token),
        is_revoked=False,
        expires_at=expires_at,
    ))


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account with Argon2id password hashing."""
    # Check if email exists
    stmt = select(User).where(User.email == request.email.lower())
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Create new user
    user = User(
        email=request.email.lower(),
        password_hash=get_password_hash(request.password),
        full_name=request.full_name,
        role="USER",
        is_active=True
    )
    db.add(user)
    await db.flush()

    # Automatically create user preference
    pref = UserPreference(
        user_id=user.id,
        theme="dark",
        default_market="US",
        default_timeframe="1Y",
        default_risk_tolerance="moderate",
        enable_alerts=False
    )
    db.add(pref)

    # Automatically create default watchlist
    default_wl = Watchlist(
        user_id=user.id,
        name="My Watchlist",
        description="Default portfolio watchlist"
    )
    db.add(default_wl)

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate credentials and return JWT access and refresh tokens."""
    stmt = select(User).where(User.email == request.email.lower())
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account."
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    # Record refresh token (hashed) in database
    _store_refresh_token(db, user.id, refresh_token)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid, non-revoked refresh token for a new access + refresh token (rotation)."""
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token."
    )
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise invalid

    # The token must exist in the DB and must not have been revoked / already used
    record = (await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == hash_token(request.refresh_token))
    )).scalar_one_or_none()
    if record is None or record.is_revoked or record.user_id != payload.get("sub"):
        raise invalid

    user = (await db.execute(select(User).where(User.id == record.user_id))).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer active."
        )

    # Rotation: old refresh token becomes unusable, a new one is issued
    record.is_revoked = True
    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)
    _store_refresh_token(db, user.id, new_refresh_token)
    await db.commit()

    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=new_refresh_token
    )


@router.post("/logout")
async def logout(
    request: Optional[LogoutRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """Revoke the given refresh token so it can no longer be used to get new access tokens.

    No access token is required: possessing the refresh token is enough to revoke it, so
    logout still works when the short-lived access token has already expired.
    """
    if request and request.refresh_token:
        record = (await db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == hash_token(request.refresh_token))
        )).scalar_one_or_none()
        if record and not record.is_revoked:
            record.is_revoked = True
            await db.commit()
    return {"message": "Successfully logged out."}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the active user profile."""
    return current_user

