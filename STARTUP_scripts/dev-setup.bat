@echo off
REM QALoader Development Environment Setup (Windows)
REM Created: June 12, 2025. 2:50 p.m. Eastern Time

echo 🔧 QALoader Development Setup
echo =============================

REM Check prerequisites
echo 📋 Checking prerequisites...

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found. Please install npm
    pause
    exit /b 1
)

echo ✅ Prerequisites satisfied

REM Navigate to project root
cd /d "%~dp0\.."
echo 📁 Working from: %CD%

REM Backend setup
echo.
echo 🐍 Setting up Python backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo ✅ Backend setup complete

REM Frontend setup
echo.
echo ⚛️ Setting up React frontend...
cd ..

echo Installing Node.js dependencies...
npm install

echo ✅ Frontend setup complete

echo.
echo 🎉 Development environment ready!
echo ================================
echo To start the application:
echo   scripts\start.bat
echo.
echo To run individual services:
echo   npm run start:backend
echo   npm run start:frontend
pause