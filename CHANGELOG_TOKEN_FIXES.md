# Changes: token refresh (frontend) + logout / refresh-token revocation (backend)

## Backend
- `core/security.py`: refresh tokens now carry a unique `jti`; added `hash_token()` (SHA-256).
- `api/v1/endpoints/auth.py`:
  - login stores the SHA-256 of the refresh token with its real expiry (`exp`), instead of an Argon2 hash of the last 16 chars with `expires_at = now`.
  - `/auth/refresh` checks the token exists in DB and is not revoked, then rotates it (old one revoked, new pair issued).
  - `/auth/logout` accepts `{"refresh_token": "..."}` and revokes it. No access token needed.
- `schemas/auth.py`: added `LogoutRequest`.

## Frontend
- `services/api.ts`: on a 401 the client calls `/auth/refresh` once (shared promise so parallel requests don't refresh twice), then retries the original request. If refresh fails the user is sent to /login. `logout()` sends the refresh token so the server can revoke it.

## Tests
- `tests/backend/test_token_refresh_logout.py` (6 new tests).

## Known limits
- An already-issued access token stays valid until it expires (15 min) after logout; only the refresh token is revoked.
- Existing users must log in again once (old refresh tokens are not in the new format).
