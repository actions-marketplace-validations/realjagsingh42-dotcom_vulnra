@echo off
echo =============================================
echo   VULNRA — Celery Worker
echo =============================================
cd /d "%~dp0"
call venv\Scripts\activate.bat
set PYTHONPATH=%CD%
python -m celery -A app.worker worker --loglevel=info --pool=solo -Q scans,sentinel
pause
