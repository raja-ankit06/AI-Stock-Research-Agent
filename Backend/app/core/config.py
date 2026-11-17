import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "AI-Powered Multi-Agent System for Market Analysis and Research"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # Security & JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-at-least-32-chars-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    # Default to SQLite for zero-config local development, or PostgreSQL when specified
    DATABASE_URL: str = "sqlite+aiosqlite:///./stock_analyst.db"

    # In-Memory Cache (Redis)
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS Allowed Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Market Data Providers
    DEFAULT_MARKET: str = "US"  # Options: US, IN, GLOBAL
    DEFAULT_PROVIDER: str = "yfinance"  # Options: yfinance, polygon, alphavantage
    POLYGON_API_KEY: str = ""
    ALPHA_VANTAGE_API_KEY: str = ""
    FMP_API_KEY: str = ""
    FINNHUB_API_KEY: str = ""

    # LLM Configuration
    LLM_PROVIDER: str = "heuristic"  # Options: heuristic, openai, anthropic, gemini
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RESEARCH_RATE_LIMIT_PER_MINUTE: int = 5


settings = Settings()

