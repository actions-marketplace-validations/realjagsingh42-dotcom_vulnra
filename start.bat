@echo off
echo =============================================
echo   VULNRA — Starting all services with Docker
echo =============================================
cd /d "%~dp0"
docker-compose down
docker-compose up --build
