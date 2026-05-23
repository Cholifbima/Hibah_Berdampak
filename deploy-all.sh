#!/bin/bash

echo "deploy started"

ROOT=~/repositories/Hibah_Berdampak


echo ""
echo "frontend"

source ~/nodevenv/repositories/Hibah_Berdampak/frontend/24/bin/activate

cd $ROOT/frontend || exit

echo "install frontend deps"
npm install --include=dev

echo "build frontend"
rm -rf .next
npm run build

echo ""
echo "backend"

source ~/nodevenv/repositories/Hibah_Berdampak/backend/24/bin/activate

cd $ROOT/backend || exit

echo "install backend deps"
rm -rf node_modules package-lock.json
~/nodevenv/repositories/Hibah_Berdampak/backend/24/bin/npm install || true

echo "prisma generate..."
npx prisma generate --schema=./prisma/schema.prisma

echo ""
echo "restart apps"

mkdir -p ~/tmp

# Restart backend
touch ~/tmp/restart.txt

# Restart frontend (Node.js Selector - kill process to auto-restart)
pkill -f "next-server" 2>/dev/null || true

echo ""
echo "deploy done"
echo ""
echo "Note: Frontend akan auto-restart oleh Passenger dalam 1-2 menit"