#!/bin/bash

echo "deploy started"

ROOT=~/repositories/Hibah_Berdampak


echo ""
echo "frontend"

source ~/nodevenv/repositories/Hibah_Berdampak/frontend/24/bin/activate

cd $ROOT/frontend || exit

echo "kill zombie node processes"
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node" 2>/dev/null || true
sleep 2

echo "install frontend deps"
npm install --include=dev

echo "clear cache"
rm -rf .next dist node_modules/.cache

echo "build frontend"
npm run build

echo "copy to public_html"
rm -rf ~/public_html/*
cp -r dist/* ~/public_html/

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