import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.database import init_db
from app.main import app

BASE = "/api/v1"
PASSWORD = "Password123!"


async def _register_and_login(client: AsyncClient) -> dict:
    email = f"tok_{uuid.uuid4().hex[:8]}@example.com"
    r = await client.post(f"{BASE}/auth/register",
                          json={"email": email, "password": PASSWORD, "full_name": "Token Tester"})
    assert r.status_code == 201
    r = await client.post(f"{BASE}/auth/login", json={"email": email, "password": PASSWORD})
    assert r.status_code == 200
    return r.json()


@pytest_asyncio.fixture
async def client():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as c:
        yield c


@pytest.mark.asyncio
async def test_refresh_returns_working_new_tokens(client):
    tokens = await _register_and_login(client)
    r = await client.post(f"{BASE}/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert r.status_code == 200
    new = r.json()
    assert new["refresh_token"] != tokens["refresh_token"]
    me = await client.get(f"{BASE}/auth/me", headers={"Authorization": f"Bearer {new['access_token']}"})
    assert me.status_code == 200


@pytest.mark.asyncio
async def test_refresh_token_is_single_use(client):
    tokens = await _register_and_login(client)
    first = await client.post(f"{BASE}/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert first.status_code == 200
    second = await client.post(f"{BASE}/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert second.status_code == 401


@pytest.mark.asyncio
async def test_logout_revokes_refresh_token(client):
    tokens = await _register_and_login(client)
    r = await client.post(f"{BASE}/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    assert r.status_code == 200
    again = await client.post(f"{BASE}/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert again.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rejects_access_token_and_garbage(client):
    tokens = await _register_and_login(client)
    r = await client.post(f"{BASE}/auth/refresh", json={"refresh_token": tokens["access_token"]})
    assert r.status_code == 401
    r = await client.post(f"{BASE}/auth/refresh", json={"refresh_token": "not-a-jwt"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rejects_valid_jwt_not_in_database(client):
    """A correctly signed refresh JWT that the server never issued/stored must be rejected."""
    from app.core.security import create_refresh_token
    forged = create_refresh_token("some-user-id")
    r = await client.post(f"{BASE}/auth/refresh", json={"refresh_token": forged})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_two_logins_in_same_second_both_work(client):
    email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    await client.post(f"{BASE}/auth/register",
                      json={"email": email, "password": PASSWORD, "full_name": "Dup Tester"})
    a = await client.post(f"{BASE}/auth/login", json={"email": email, "password": PASSWORD})
    b = await client.post(f"{BASE}/auth/login", json={"email": email, "password": PASSWORD})
    assert a.status_code == 200 and b.status_code == 200
    assert a.json()["refresh_token"] != b.json()["refresh_token"]
