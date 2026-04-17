@echo off
echo =============================================
echo   VULNRA — Starting all services
echo =============================================
start "VULNRA Backend" cmd /k "cd /d %~dp0 && call venv\Scripts\activate.bat && set PYTHONPATH=%CD% && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
start "VULNRA Worker" cmd /k "cd /d %~dp0 && call venv\Scripts\activate.bat && set PYTHONPATH=%CD% && python -m celery -A app.worker worker --loglevel=info --pool=solo -Q scans,sentinel"
start "VULNRA Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo All services starting in separate windows.
echo   Backend:   http://localhost:8000
echo   Frontend:  http://localhost:3000
echo   Docs:      http://localhost:8000/docs
echo.
pause
