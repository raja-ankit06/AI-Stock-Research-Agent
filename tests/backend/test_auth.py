import pytest
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing():
    password = "MySecurePassword2026!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_lifecycle():
    user_id = "test-user-uuid-1234"
    access_token = create_access_token(user_id)
    payload = decode_token(access_token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["type"] == "access"

    refresh_token = create_refresh_token(user_id)
    r_payload = decode_token(refresh_token)
    assert r_payload is not None
    assert r_payload["sub"] == user_id
    assert r_payload["type"] == "refresh"
