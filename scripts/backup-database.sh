#!/bin/bash
# ==========================================
# MALA PLATFORM - AUTOMATED DATABASE BACKUP SCRIPT
# ==========================================
set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mala_backup_${TIMESTAMP}.sql.gz"

CONTAINER_NAME="${POSTGRES_CONTAINER:-mala-postgres}"
DB_NAME="${POSTGRES_DB:-mala_db}"
DB_USER="${POSTGRES_USER:-postgres}"

mkdir -p "$BACKUP_DIR"

echo "📦 Creating PostgreSQL backup for ${DB_NAME} at ${BACKUP_FILE}..."

if docker ps | grep -q "$CONTAINER_NAME"; then
  docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
else
  pg_dump -U "$DB_USER" -h "${POSTGRES_HOST:-localhost}" "$DB_NAME" | gzip > "$BACKUP_FILE"
fi

echo "✅ Backup completed successfully: ${BACKUP_FILE} ($(du -h "$BACKUP_FILE" | cut -f1))"

# Retention policy: remove backups older than 30 days
find "$BACKUP_DIR" -type f -name "mala_backup_*.sql.gz" -mtime +30 -delete
echo "🧹 Old backups older than 30 days cleaned up."

