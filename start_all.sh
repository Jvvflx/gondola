#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) to run cleanup
trap cleanup SIGINT

# Function to check and kill port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)..."
        kill -9 $pid 2>/dev/null
    fi
}

# Clean up ports before starting
echo "Cleaning up ports..."
kill_port 3001 # Backend
kill_port 8000 # Mangaba
kill_port 3000 # Frontend (Vite)

echo "Starting Gondola System..."

# 1. Start Backend
echo "Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 2. Start Mangaba Service (AI)
echo "Starting Mangaba AI Service..."
cd mangaba_service
# Check if venv exists, if not just run python3 (assuming dependencies are installed)
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python3 main.py &
MANGABA_PID=$!
cd ..

# 3. Start Frontend
echo "Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

echo "All services started!"
echo "Backend PID: $BACKEND_PID"
echo "Mangaba PID: $MANGABA_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all services."

# Wait for all background processes
wait
