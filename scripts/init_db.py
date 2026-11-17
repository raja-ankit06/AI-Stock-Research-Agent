"""
Database initialization and demonstration seeding script.
Creates tables, default demo analyst user, and sample watchlist.
Usage: python scripts/init_db.py
"""

import asyncio
import os
import sys

# Ensure backend directory is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import AsyncSessionLocal, init_db
from app.core.security import get_password_hash
from app.models.user import User, UserPreference
from app.models.watchlist import Watchlist, WatchlistItem
from sqlalchemy import select


async def seed():
    print("Initializing database tables...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # Check if demo user already exists
        email = "analyst@firm.com"
        stmt = select(User).where(User.email == email)
        res = await session.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            print(f"Creating default demo user: {email} / Password123!")
            user = User(
                email=email,
                password_hash=get_password_hash("Password123!"),
                full_name="Lead Financial Analyst",
                role="ADMIN",
                is_active=True
            )
            session.add(user)
            await session.flush()

            pref = UserPreference(
                user_id=user.id,
                theme="dark",
                default_market="US",
                default_timeframe="1Y",
                default_risk_tolerance="moderate",
                enable_alerts=True
            )
            session.add(pref)

            wl = Watchlist(
                user_id=user.id,
                name="Core Semiconductor & Tech",
                description="High-conviction AI infrastructure stocks"
            )
            session.add(wl)
            await session.flush()

            # Add default stocks to watchlist
            stocks = [
                ("NVDA", "NVIDIA Corporation"),
                ("AAPL", "Apple Inc."),
                ("MSFT", "Microsoft Corporation"),
                ("RELIANCE.NS", "Reliance Industries Limited"),
            ]
            for sym, name in stocks:
                session.add(WatchlistItem(
                    watchlist_id=wl.id,
                    symbol=sym,
                    company_name=name
                ))

            await session.commit()
            print("Demo user and default watchlist created successfully!")
        else:
            print(f"Demo user {email} already exists.")


if __name__ == "__main__":
    asyncio.run(seed())
