@echo off
setlocal

set "ROOT=%~dp0"

echo Starting KalaKart services...
echo.

REM Prevent EADDRINUSE on reruns by clearing common dev ports.
for %%P in (3000 3001 3002 3003 5000 8001) do call :KillPort %%P

REM Try to ensure MongoDB is running (non-fatal if Docker is unavailable).
where docker >nul 2>&1
if %errorlevel%==0 (
	pushd "%ROOT%"
	docker compose up -d mongodb >nul 2>&1
	if %errorlevel%==0 (
		echo MongoDB container ensured via Docker Compose.
	) else (
		echo Warning: Could not start MongoDB via Docker Compose. Continuing...
	)
	popd
) else (
	echo Warning: Docker not found on PATH. Continuing without auto-starting MongoDB.
)

REM Start frontend (Vite)
start "KalaKart Frontend" cmd /k "cd /d ""%ROOT%Frontend"" && npm run dev"

REM Start backend (Node/Express)
start "KalaKart Backend" cmd /k "cd /d ""%ROOT%"" && npm run dev"

REM Start AI service (FastAPI/Uvicorn)
start "KalaKart AI" cmd /k "cd /d ""%ROOT%AI"" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001"

echo All services launched in separate terminals.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo AI:       http://localhost:8001
echo.
echo If Python is not found, install Python or replace 'python' with your environment command.

endlocal
goto :EOF

:KillPort
for /f "tokens=5" %%A in ('netstat -aon ^| findstr ":%~1" ^| findstr "LISTENING"') do (
	taskkill /F /PID %%A >nul 2>&1
)
exit /b 0
