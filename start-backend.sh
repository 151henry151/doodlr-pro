#!/bin/bash
set -euo pipefail

echo "🚀 Starting Doodlr backend (FastAPI)"

# Check python
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ Python 3 is not installed"
  exit 1
fi

cd "$(dirname "$0")/backend"

# Create venv if missing
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

# Activate and install deps
source venv/bin/activate
pip install -r requirements.txt

# Start backend with hot reload
echo "🔧 Running on http://0.0.0.0:8000 (press Ctrl+C to stop)"
exec uvicorn main:app --reload --host 0.0.0.0 --port 8000 