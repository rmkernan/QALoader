#!/bin/bash
# QALoader Application Startup Script
# Created: June 12, 2025. 2:45 p.m. Eastern Time

echo "🚀 Starting QALoader Application..."
echo "================================="

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
        return 1
    fi
    return 0
}

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down QALoader..."
    jobs -p | xargs -r kill
    echo "✅ All services stopped"
    exit 0
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Check if backend virtual environment exists
if [ ! -d "../backend/venv" ]; then
    echo "❌ Backend virtual environment not found at ../backend/venv"
    echo "Please run the setup script first:"
    echo "  ./dev-setup.sh"
    exit 1
fi

# Check ports
check_port 8000 || exit 1
check_port 5173 || exit 1

echo "📁 Starting from: $(pwd)"

# Start backend
echo "🔧 Starting FastAPI backend on port 8000..."
cd ../backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend failed to start on port 8000"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo "✅ Backend running at http://localhost:8000"

# Start frontend with Vite
echo "🎨 Starting Vite frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 3

echo ""
echo "🎉 QALoader is ready!"
echo "================================="
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🔑 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running and wait for user interrupt
wait