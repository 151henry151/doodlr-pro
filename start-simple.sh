#!/bin/bash

# Doodlr Simple Startup Script

echo "🚀 Starting Doodlr - Collaborative Drawing App"
echo "=============================================="

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

# Ensure backend is cleaned up on exit or Ctrl+C
cleanup() {
    echo "🛑 Stopping Doodlr..."
    kill $BACKEND_PID 2>/dev/null
}
trap cleanup INT TERM EXIT

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Start frontend in foreground so Expo receives keyboard input
echo "📱 Starting frontend..."
npx expo start

# When Expo exits, the trap will clean up the backend 