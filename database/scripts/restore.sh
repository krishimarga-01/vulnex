#!/bin/bash
# Restore script for Extreme Weather Database
set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "Usage: ./scripts/restore.sh <path_to_backup_file.sql.gz>"
    exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-extreme_weather_db}"
DB_USER="${DB_USERNAME:-postgres}"

echo "Restoring database $DB_NAME from $BACKUP_FILE..."

if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1

echo "Database restoration completed successfully!"
