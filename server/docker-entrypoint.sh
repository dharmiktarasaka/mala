#!/bin/sh
set -e

# Automatically run Prisma database migrations on startup if DATABASE_URL is configured
if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Applying PostgreSQL migrations via Prisma..."
  npx prisma migrate deploy || echo "⚠️ Migration command skipped or database not ready, proceeding with application launch..."
fi

exec "$@"

