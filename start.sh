#!/bin/sh

echo "Starting SiteOps services..."

# Start Python service in background
echo "Starting Python service on port 8000..."
cd /app/python_service && python3 -m uvicorn python_service.main:app --host 0.0.0.0 --port 8000 &
PYTHON_PID=$!

# Start Next.js in foreground
echo "Starting Next.js app on port 3000..."
cd /app/web
npm start

# If Node exits, kill Python too
kill $PYTHON_PID