#!/bin/bash
# Backup script for Extreme Weather Database
set -e

BACKUP_DIR="${1:-./backups}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/extreme_weather_db_backup_$TIMESTAMP.sql.gz"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-extreme_weather_db}"
DB_USER="${DB_USERNAME:-postgres}"

echo "Creating compressed PostGIS database backup to $FILENAME..."

if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F p "$DB_NAME" | gzip > "$FILENAME"

echo "Backup completed successfully! Size: $(du -h "$FILENAME" | cut -f1)"
