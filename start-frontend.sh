#!/bin/bash
set -euo pipefail

echo "📱 Starting Doodlr frontend (Expo)"

# Check node & npm
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed"
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is not installed"
  exit 1
fi

cd "$(dirname "$0")/frontend"

# Install deps
if [ -f package-lock.json ]; then
  npm ci || npm install --legacy-peer-deps
else
  npm install --legacy-peer-deps
fi

# Start Expo in foreground (accepts keyboard input)
echo "▶️  Starting Expo dev server (press Ctrl+C to stop)"
exec npx expo start 