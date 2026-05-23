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

echo "🧹 clean frontend"
rm -rf .next

echo "📦 install frontend deps"
npm install --include=dev

echo "🏗 build frontend"
npm run build

########################################
# BACKEND
########################################

echo ""
echo "⚙️ backend"

source ~/nodevenv/repositories/Hibah_Berdampak/backend/24/bin/activate

cd $ROOT/backend || exit

echo "📦 install backend deps"
npm install --include=dev

echo "🧠 prisma generate"
npx prisma generate --schema=./prisma/schema.prisma

########################################
# RESTART APPS
########################################

echo ""
echo "🔄 restart apps"

mkdir -p ~/tmp

touch ~/tmp/restart.txt

########################################
# DONE
########################################

echo ""
echo "✅ deploy done"