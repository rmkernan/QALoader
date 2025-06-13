#!/bin/bash
# QALoader Development Environment Setup
# Created: June 12, 2025. 2:50 p.m. Eastern Time

echo "🔧 QALoader Development Setup"
echo "============================="

# Function to check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo "✅ Prerequisites satisfied"

# Navigate to project root
cd "$(dirname "$0")/.."

echo "📁 Working from: $(pwd)"

# Backend setup
echo ""
echo "🐍 Setting up Python backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete"

# Frontend setup
echo ""
echo "⚛️ Setting up React frontend..."
cd ..

echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete"

echo ""
echo "🎉 Development environment ready!"
echo "================================"
echo "To start the application:"
echo "  ./scripts/start.sh"
echo ""
echo "To run individual services:"
echo "  npm run start:backend"
echo "  npm run start:frontend"