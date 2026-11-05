#!/bin/bash
# ==========================================
# MALA PLATFORM - DATABASE RESTORE SCRIPT
# ==========================================
set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore-database.sh <path-to-backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${POSTGRES_CONTAINER:-mala-postgres}"
DB_NAME="${POSTGRES_DB:-mala_db}"
DB_USER="${POSTGRES_USER:-postgres}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

echo "⚠️  WARNING: Restoring will overwrite existing data in '${DB_NAME}'!"
read -p "Are you sure you want to proceed? (y/N): " -r CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
  echo "Restore aborted."
  exit 0
fi

echo "🔄 Restoring ${DB_NAME} from ${BACKUP_FILE}..."

if docker ps | grep -q "$CONTAINER_NAME"; then
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
else
  gunzip -c "$BACKUP_FILE" | psql -U "$DB_USER" -h "${POSTGRES_HOST:-localhost}" -d "$DB_NAME"
fi

echo "✅ Database restored successfully!"

