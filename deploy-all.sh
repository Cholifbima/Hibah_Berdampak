#!/bin/bash

echo "🚀 deploy started"

ROOT=~/repositories/Hibah_Berdampak

########################################
# FRONTEND
########################################

echo ""
echo "🎨 frontend"

source ~/nodevenv/repositories/Hibah_Berdampak/frontend/24/bin/activate

cd $ROOT/frontend || exit

echo "🧹 clear frontend cache"
rm -rf .next

echo "🏗 build frontend"
npm run build

########################################
# BACKEND
########################################

echo ""
echo "⚙️ backend"

source ~/nodevenv/repositories/Hibah_Berdampak/backend/24/bin/activate

cd $ROOT/backend || exit

echo "🧠 prisma generate"

./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

########################################
# RESTART PASSENGER
########################################

echo ""
echo "🔄 restart apps"

mkdir -p ~/tmp
touch ~/tmp/restart.txt

echo ""
echo "✅ deploy success"