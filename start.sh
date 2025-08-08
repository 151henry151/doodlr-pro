#!/bin/bash

# Doodlr Startup Script with Health Checks

echo "🚀 Starting Doodlr - Collaborative Drawing App"
echo "=============================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check if ports are available
if port_in_use 8000; then
    echo "❌ Port 8000 is already in use. Please stop the service using port 8000"
    exit 1
fi

echo "✅ Port 8000 is available"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Start backend
echo "🔧 Starting backend server..."
source venv/bin/activate && python main.py &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:8000/health >/dev/null; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend is running at http://localhost:8000"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Start frontend
echo "📱 Starting frontend..."
npx expo start &
FRONTEND_PID=$!

echo ""
echo "🎉 Doodlr is now running!"
echo "========================="
echo "📱 Frontend: Expo development server"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "To stop the app, press Ctrl+C"

# Wait for user to stop
trap "echo '🛑 Stopping Doodlr...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 