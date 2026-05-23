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

cd $ROOT/backend || exit

echo "install backend deps"
npm install || true

echo "prisma generate..."
npx prisma generate --schema=./prisma/schema.prisma

echo ""
echo "restart apps"

touch ~/tmp/restart.txt

echo ""
echo "deploy done"