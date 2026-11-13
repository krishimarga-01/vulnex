#!/bin/bash
set -e

echo "=========================================================="
echo "Initializing Extreme Weather Emergency Response Database"
echo "=========================================================="

export PGPASSWORD="${POSTGRES_PASSWORD}"
DB="${POSTGRES_DB:-extreme_weather_db}"
USER="${POSTGRES_USER:-postgres}"

echo "[1/3] Enabling Extensions..."
psql -v ON_ERROR_STOP=1 --username "$USER" --dbname "$DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "postgis";
EOSQL

echo "[2/3] Executing Flyway Migrations (V1 to V10)..."
MIGRATION_DIR="/docker-entrypoint-initdb.d/migrations"

for file in $(ls $MIGRATION_DIR/V*__*.sql | sort -V); do
    echo "  Applying migration: $(basename "$file")"
    psql -v ON_ERROR_STOP=1 --username "$USER" --dbname "$DB" -f "$file"
done

echo "[3/3] Applying Demonstration Seed Data..."
SEED_FILE="/docker-entrypoint-initdb.d/seeds/demo_data.sql"
if [ -f "$SEED_FILE" ]; then
    echo "  Applying seeds: $(basename "$SEED_FILE")"
    psql -v ON_ERROR_STOP=1 --username "$USER" --dbname "$DB" -f "$SEED_FILE"
fi

echo "=========================================================="
echo "Database Initialization Completed Successfully!"
echo "=========================================================="
