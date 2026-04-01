@echo off
setlocal

echo Starting KalaKart services...
echo.

REM Prevent EADDRINUSE on reruns by clearing common dev ports.
for %%P in (3000 3001 3002 3003 5000 8001) do (
	for /f "tokens=5" %%A in ('netstat -aon ^| findstr ":%%P" ^| findstr "LISTENING"') do (
		taskkill /F /PID %%A >nul 2>&1
	)
)

REM Start frontend (Vite)
start "KalaKart Frontend" cmd /k "cd /d ""%~dp0Frontend"" && npm run dev"

REM Start backend (Node/Express)
start "KalaKart Backend" cmd /k "cd /d ""%~dp0"" && npm run dev"

REM Start AI service (FastAPI/Uvicorn)
start "KalaKart AI" cmd /k "cd /d ""%~dp0AI"" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001"

echo All services launched in separate terminals.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo AI:       http://localhost:8001
echo.
echo If Python is not found, install Python or replace 'python' with your environment command.

endlocal
