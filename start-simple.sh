#!/bin/bash

# Doodlr Startup Script (Simple Version)
echo "🎨 Starting Doodlr Collaborative Canvas App..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the doodlr project root directory"
    exit 1
fi

# Check prerequisites
print_header "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi
print_status "Python 3 found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi
print_status "Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi
print_status "npm found: $(npm --version)"

print_header "Setting up backend..."

# Install backend dependencies
cd backend
print_status "Installing Python dependencies..."
if pip install -r requirements.txt; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Start backend server in background
print_status "Starting backend server on http://localhost:8000..."
python main.py &
BACKEND_PID=$!

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 8

print_status "Backend server started (PID: $BACKEND_PID)"
print_status "API documentation available at: http://localhost:8000/docs"

# Go back to root directory
cd ..

print_header "Setting up frontend..."

# Install frontend dependencies
cd frontend
print_status "Installing frontend dependencies..."
if npm install; then
    print_status "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

print_status "Starting Expo development server..."
print_status "The app will open in your browser or Expo Go app"
print_status "Backend API: http://localhost:8000"
print_status "Frontend: http://localhost:19006 (or Expo Go app)"
print_warning "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    print_status "Doodlr app stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start frontend (this will block until the user stops it)
npx expo start

# Cleanup when frontend exits
cleanup 