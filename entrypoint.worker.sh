#!/bin/sh
set -e

echo "🔧 Worker Starting..."
echo "Waiting for database to be ready..."
sleep 5

echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting worker process..."
exec node dist/src/worker.js
