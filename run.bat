@echo off
echo Starting HRMS Application...
echo.
echo Starting Backend Server (Port 5000)...
start "HRMS Backend" cmd /k "cd d:\hrms-lite-backend && node server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
start "HRMS Frontend" cmd /k "cd d:\hrms-lite-backend\hrms-frontend && npm start"

echo.
echo ========================================
echo HRMS Application is starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
pause >nul

