@echo off
REM QALoader Application Startup Script (Windows)
REM Created: June 12, 2025. 2:45 p.m. Eastern Time

echo 🚀 Starting QALoader Application...
echo =================================

echo 📁 Starting from: %CD%

REM Check if backend virtual environment exists
if not exist "..\backend\venv" (
    echo ❌ Backend virtual environment not found at ..\backend\venv
    echo Please run the setup script first:
    echo   dev-setup.bat
    pause
    exit /b 1
)

echo 🔧 Starting FastAPI backend on port 8000...
start "QALoader Backend" cmd /k "cd ..\backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo 🎨 Starting Vite frontend on port 5173...
start "QALoader Frontend" cmd /k "cd .. && npm run dev"

echo.
echo 🎉 QALoader is starting up!
echo =================================
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo 🔑 Login credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo Close the terminal windows to stop the services
pause