<#
.SYNOPSIS
    Restores the Extreme Weather PostgreSQL database from a SQL backup.
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$HostName = "localhost",
    [string]$Port = "5432",
    [string]$Database = "extreme_weather_db",
    [string]$User = "postgres"
)

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
    exit 1
}

Write-Host "Restoring database from $BackupFile..." -ForegroundColor Cyan

$containerName = "extreme_weather_postgres"
$dockerRunning = docker ps --filter "name=$containerName" --format "{{.Names}}" 2>$null

if ($dockerRunning -eq $containerName) {
    Write-Host "Restoring into active Docker container: $containerName" -ForegroundColor Green
    Get-Content $BackupFile | docker exec -i $containerName psql -U $User -d $Database
} else {
    Write-Host "Restoring via local psql..." -ForegroundColor Yellow
    & psql -h $HostName -p $Port -U $User -d $Database -f $BackupFile
}

Write-Host "Restoration process completed." -ForegroundColor Green
