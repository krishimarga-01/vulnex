#!/bin/bash
# ============================================================================
# Setup Script for Extreme Weather Emergency Response Database
# Supported OS: Linux, macOS, WSL
# ============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BASE_DIR"

echo "=========================================================="
echo " Extreme Weather Emergency Response System - Setup Script"
echo "=========================================================="

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-extreme_weather_db}"
DB_USER="${DB_USERNAME:-postgres}"
DB_PASS="${DB_PASSWORD:-postgres_dev_secret_2026}"

echo "Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check Docker availability
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "[Docker Mode Detected]"
    echo "Starting PostgreSQL 16 + PostGIS via Docker Compose..."
    docker compose up -d db
    echo "Waiting for PostgreSQL container to become healthy..."
    until [ "$(docker inspect -f {{.State.Health.Status}} extreme_weather_postgres 2>/dev/null)" == "healthy" ]; do
        sleep 2
        printf "."
    done
    echo ""
    echo "PostgreSQL container is healthy and initialized!"
    echo "Migrations V1 to V10 and demo seeds were applied automatically."
elif command -v psql &> /dev/null; then
    echo "[Native PostgreSQL Mode Detected]"
    export PGPASSWORD="$DB_PASS"

    echo "Checking if database '$DB_NAME' exists..."
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "Creating database '$DB_NAME'..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
    fi

    echo "Applying migrations V1 to V10..."
    for f in $(ls migrations/V*__*.sql | sort -V); do
        echo "  Applying $(basename "$f")..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$f"
    done

    echo "Applying demonstration seeds..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f seeds/demo_data.sql
else
    echo "ERROR: Neither Docker nor psql client could be detected."
    echo "Please install Docker Desktop or PostgreSQL 16 client tools."
    exit 1
fi

echo ""
echo "=========================================================="
echo " Setup Completed Successfully!"
echo " Next Steps:"
echo "   - Connect backend to jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"
echo "   - Read documentation in ./documentation"
echo "=========================================================="
