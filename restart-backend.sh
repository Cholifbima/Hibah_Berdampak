#!/bin/bash
# Manual restart script for backend

echo "Killing node processes..."
pkill -9 -f "node" 2>/dev/null || true
pkill -9 -f "index.js" 2>/dev/null || true

sleep 2

echo "Starting backend..."
cd ~/repositories/Hibah_Berdampak/backend
source ~/nodevenv/repositories/Hibah_Berdampak/backend/24/bin/activate
node index.js &

echo "Backend started on port 5000"
