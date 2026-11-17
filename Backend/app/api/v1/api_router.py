from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    reports,
    research,
    stocks,
    users,
    watchlists,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(stocks.router, prefix="/stocks", tags=["Stocks & Market Data"])
api_router.include_router(research.router, prefix="/research", tags=["Multi-Agent Research"])
api_router.include_router(watchlists.router, prefix="/watchlists", tags=["Watchlists"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Exports"])

