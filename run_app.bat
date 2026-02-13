@echo off
echo ===================================================
echo Starting YouTube Downloader Application
echo ===================================================

echo Starting Backend Server (Flask)...
start "YouTube Downloader Backend" cmd /k "cd /d %~dp0 && python app.py"

echo Waiting for backend to initialize...
timeout /t 2 /nobreak >nul

echo Starting Frontend Server (Vite)...
start "YouTube Downloader Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ===================================================
echo App launched! Check the new windows.
echo Frontend should automatically open in your browser 
echo or visit: http://localhost:5173
echo ===================================================
pause
