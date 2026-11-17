import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.database import AsyncSessionLocal, init_db


@pytest.mark.asyncio
async def test_complete_research_lifecycle():
    await init_db()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health check
        resp = await client.get("/api/v1/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

        # 2. Register new test user
        import uuid
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        reg_resp = await client.post("/api/v1/auth/register", json={
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Integration Test Analyst"
        })
        assert reg_resp.status_code == 201

        # 3. Login
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": unique_email,
            "password": "Password123!"
        })
        assert login_resp.status_code == 200
        tokens = login_resp.json()
        access_token = tokens["access_token"]
        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # 4. Search stock
        search_resp = await client.get("/api/v1/stocks/search?q=NVDA", headers=auth_headers)
        assert search_resp.status_code == 200
        search_data = search_resp.json()
        assert len(search_data["results"]) > 0

        # 5. Get stock overview
        overview_resp = await client.get("/api/v1/stocks/NVDA", headers=auth_headers)
        assert overview_resp.status_code == 200
        overview = overview_resp.json()
        assert overview["symbol"] == "NVDA"
        assert overview["current_price"] > 0

        # 6. Trigger Multi-Agent Research
        res_resp = await client.post("/api/v1/research", json={"symbol": "NVDA"}, headers=auth_headers)
        assert res_resp.status_code == 202
        res_data = res_resp.json()
        research_id = res_data["research_id"]
        assert research_id is not None

        # 7. Check research session in history
        history_resp = await client.get("/api/v1/research", headers=auth_headers)
        assert history_resp.status_code == 200
        history_items = history_resp.json()["items"]
        assert any(item["research_id"] == research_id for item in history_items)

        # 8. Watchlist interaction
        wl_resp = await client.get("/api/v1/watchlists", headers=auth_headers)
        assert wl_resp.status_code == 200
        watchlists = wl_resp.json()
        assert len(watchlists) > 0
        default_wl = watchlists[0]

        # Add stock to watchlist
        add_wl_resp = await client.post(
            f"/api/v1/watchlists/{default_wl['id']}/stocks",
            json={"symbol": "NVDA"},
            headers=auth_headers
        )
        assert add_wl_resp.status_code == 201

        # Verify stock in watchlist
        updated_wl_resp = await client.get("/api/v1/watchlists", headers=auth_headers)
        updated_wl = updated_wl_resp.json()[0]
        symbols_in_wl = [it["symbol"] for it in updated_wl["items"]]
        assert "NVDA" in symbols_in_wl
