# Multi-Agent Stock Research Analyst Development Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Multi-Agent Stock Research Analyst (Dev Mode)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Initialize DB if not present
$env:PYTHONPATH="backend"
Write-Host "[1/3] Ensuring database is initialized..." -ForegroundColor Yellow
& "backend\.venv\Scripts\python.exe" scripts\init_db.py

# 2. Start Backend in new process
Write-Host "[2/3] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='backend'; cd backend; .venv\Scripts\uvicorn.exe app.main:app --reload --port 8000" -PassThru

# 3. Start Frontend in new process
Write-Host "[3/3] Launching React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Write-Host "Application launched successfully!" -ForegroundColor Green
Write-Host "- Web UI: http://localhost:5173" -ForegroundColor White
Write-Host "- Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "- Default Demo Login: analyst@firm.com / Password123!" -ForegroundColor White
