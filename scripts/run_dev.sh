#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Starting Multi-Agent Stock Research Analyst (Dev Mode)"
echo "=========================================================="

export PYTHONPATH="backend"

# 1. Initialize DB
echo "[1/3] Ensuring database is initialized..."
python scripts/init_db.py

# 2. Start Backend & Frontend concurrently
echo "[2/3] Starting Backend & Frontend..."
trap 'kill 0' EXIT

(cd backend && uvicorn app.main:app --reload --port 8000) &
(cd frontend && npm run dev) &

wait
