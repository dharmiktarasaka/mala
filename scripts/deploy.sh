#!/bin/bash
# ========================================================
# MALA PLATFORM - 1-COMMAND VPS / CLOUD DEPLOYMENT SCRIPT
# ========================================================
set -e

echo "🕉️  Starting MALA Platform Deployment..."

# 1. Check for docker and docker-compose
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is not installed. Please install Docker first."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose v2 is not installed."; exit 1; }

# 2. Check for environment file
if [ ! -f ".env" ]; then
  if [ -f "server/.env.production.example" ]; then
    echo "📄 Creating .env from production example..."
    cp server/.env.production.example .env
    echo "⚠️  Please update .env with your domain names and secrets!"
  fi
fi

# 3. Pull latest code (if git repository)
if [ -d ".git" ]; then
  echo "📥 Pulling latest git updates..."
  git pull origin main || true
fi

# 4. Build and start containers with zero-downtime rolling update
echo "🏗️  Building and deploying containers..."
docker compose build --pull
docker compose up -d --remove-orphans

# 5. Wait for backend health check
echo "⏳ Waiting for MALA Backend health check..."
ATTEMPTS=0
MAX_ATTEMPTS=30
until docker compose exec -T backend wget --spider -q http://localhost:3000/api/v1/health || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do
  sleep 2
  ATTEMPTS=$((ATTEMPTS+1))
  echo -n "."
done
echo ""

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
  echo "❌ Health check timed out! Check logs with: docker compose logs backend"
  exit 1
fi

echo "=========================================================="
echo "🎉 MALA Platform successfully deployed!"
echo "   Frontend Web:      http://localhost"
echo "   Backend API Docs:  http://localhost:3000/api/docs"
echo "   Health Check:      http://localhost:3000/api/v1/health"
echo "=========================================================="

