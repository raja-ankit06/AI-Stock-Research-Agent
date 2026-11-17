from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=2, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    password: Optional[str] = Field(None, min_length=8)


class UserPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    theme: str
    default_market: str
    default_timeframe: str
    default_risk_tolerance: str
    enable_alerts: bool
    updated_at: datetime


class UserPreferenceUpdate(BaseModel):
    theme: Optional[str] = Field(None, pattern="^(dark|light)$")
    default_market: Optional[str] = Field(None, pattern="^(US|IN|GLOBAL)$")
    default_timeframe: Optional[str] = Field(None, pattern="^(1M|3M|6M|1Y|5Y)$")
    default_risk_tolerance: Optional[str] = Field(None, pattern="^(conservative|moderate|aggressive)$")
    enable_alerts: Optional[bool] = None
