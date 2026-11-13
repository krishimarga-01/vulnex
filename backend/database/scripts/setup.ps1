<#
.SYNOPSIS
    Automated turnkey setup script for Windows developers.
.DESCRIPTION
    Configures .env, starts Docker Compose or applies migrations via local psql,
    and runs the test verification suite.
#>

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$baseDir = Split-Path -Parent $scriptDir
Set-Location $baseDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Extreme Weather Emergency Response System - Setup Script" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Check Docker availability
$dockerAvailable = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerAvailable = $true }
} catch {}

if ($dockerAvailable) {
    Write-Host "[Docker Mode Detected]" -ForegroundColor Green
    Write-Host "Starting PostgreSQL 16 + PostGIS via Docker Compose..." -ForegroundColor Yellow
    docker compose up -d db

    Write-Host "Waiting for container to become healthy..." -ForegroundColor Yellow
    $healthy = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 2
        $status = docker inspect -f '{{.State.Health.Status}}' extreme_weather_postgres 2>$null
        if ($status -eq "healthy") {
            $healthy = $true
            break
        }
        Write-Host "." -NoNewline
    }
    Write-Host ""
    if ($healthy) {
        Write-Host "PostgreSQL container is healthy and initialized!" -ForegroundColor Green
    } else {
        Write-Host "Container started. Migrations and seeds running via init-db.sh." -ForegroundColor Yellow
    }
} else {
    Write-Host "[Native PostgreSQL Mode]" -ForegroundColor Yellow
    Write-Host "Docker was not detected. If you have a local PostgreSQL 16 server running:" -ForegroundColor Gray
    Write-Host "Run migrations using Flyway or execute:" -ForegroundColor Gray
    Write-Host "  psql -U postgres -d extreme_weather_db -f scripts\init_complete_database.sql" -ForegroundColor White
    Write-Host "  psql -U postgres -d extreme_weather_db -f seeds\demo_data.sql" -ForegroundColor White
}

# Run Schema Verification Test Suite
Write-Host "`nRunning automated verification suite..." -ForegroundColor Cyan
& powershell -ExecutionPolicy Bypass -File ".\scripts\test_runner.ps1"

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Setup Process Completed!" -ForegroundColor Green
Write-Host " Review ./documentation for backend integration specifications." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
