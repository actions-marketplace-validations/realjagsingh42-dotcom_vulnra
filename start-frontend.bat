@echo off
echo =============================================
echo   VULNRA — Frontend (Next.js)
echo   http://localhost:3000
echo =============================================
cd /d "%~dp0frontend"
call npm run dev
pause
