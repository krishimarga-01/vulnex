<#
.SYNOPSIS
    Backs up the Extreme Weather PostgreSQL database to a timestamped compressed file.
#>
param (
    [string]$BackupDir = ".\backups",
    [string]$HostName = "localhost",
    [string]$Port = "5432",
    [string]$Database = "extreme_weather_db",
    [string]$User = "postgres"
)

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFile = Join-Path $BackupDir "extreme_weather_db_backup_$timestamp.sql"

Write-Host "Creating database backup using pg_dump or docker..." -ForegroundColor Cyan

# Check if running in Docker
$containerName = "extreme_weather_postgres"
$dockerRunning = docker ps --filter "name=$containerName" --format "{{.Names}}" 2>$null

if ($dockerRunning -eq $containerName) {
    Write-Host "Exporting from active Docker container: $containerName" -ForegroundColor Green
    docker exec -t $containerName pg_dump -U $User -d $Database > $dumpFile
} else {
    Write-Host "Exporting using local pg_dump..." -ForegroundColor Yellow
    & pg_dump -h $HostName -p $Port -U $User -F p -f $dumpFile $Database
}

if (Test-Path $dumpFile) {
    Write-Host "Backup created successfully at $dumpFile" -ForegroundColor Green
} else {
    Write-Error "Backup creation failed. Ensure PostgreSQL or Docker is active."
}
