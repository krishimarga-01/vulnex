<#
.SYNOPSIS
    Automated Schema Verification, Integrity, and Test Suite for Extreme Weather Database
.DESCRIPTION
    Validates migrations V1-V10, seed data referential integrity, dashboard query completeness,
    and PostGIS spatial configurations.
#>

$ErrorActionPreference = "Stop"

$baseDir = Split-Path -Parent $PSScriptRoot
if (-not $baseDir -or -not (Test-Path $baseDir)) {
    $baseDir = (Get-Location).Path
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  EXTREME WEATHER SYSTEM: DATABASE ARCHITECTURE VERIFICATION     " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Base Directory: $baseDir`n" -ForegroundColor Gray

$testsPassed = 0
$testsFailed = 0

function Assert-Test {
    param (
        [string]$Description,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "  [PASS] $Description" -ForegroundColor Green
        if ($Details) { Write-Host "         $Details" -ForegroundColor DarkGray }
        $script:testsPassed++
    } else {
        Write-Host "  [FAIL] $Description" -ForegroundColor Red
        if ($Details) { Write-Host "         Error: $Details" -ForegroundColor Red }
        $script:testsFailed++
    }
}

# =============================================================================
# TEST SUITE 1: FILE SYSTEM & MIGRATION NAMING CONVENTIONS
# =============================================================================
Write-Host "[Suite 1] File Hierarchy and Migration File Naming Verification" -ForegroundColor Yellow

$expectedMigrations = @(
    "V1__create_user_management.sql",
    "V2__create_vulnerability_management.sql",
    "V3__create_geographical_management.sql",
    "V4__create_weather_management.sql",
    "V5__create_risk_assessment.sql",
    "V6__create_emergency_management.sql",
    "V7__create_response_team_management.sql",
    "V8__create_notification_management.sql",
    "V9__create_audit_and_security.sql",
    "V10__create_indexes_and_constraints.sql"
)

foreach ($mig in $expectedMigrations) {
    $filePath = Join-Path "$baseDir\migrations" $mig
    Assert-Test -Description "Migration file exists: $mig" -Condition (Test-Path $filePath)
}

$expectedDocs = @(
    "ER_DIAGRAM.md",
    "DATABASE_SCHEMA.md",
    "BACKEND_INTEGRATION.md",
    "TABLE_RELATIONSHIPS.md",
    "HANDOVER_DOCUMENT.md"
)
foreach ($doc in $expectedDocs) {
    $filePath = Join-Path "$baseDir\documentation" $doc
    Assert-Test -Description "Documentation file exists: $doc" -Condition (Test-Path $filePath)
}

$expectedScripts = @(
    "init-db.sh",
    "init_complete_database.sql",
    "setup.sh",
    "setup.ps1",
    "backup.sh",
    "restore.sh",
    "backup.ps1",
    "restore.ps1",
    "test_runner.ps1"
)
foreach ($sc in $expectedScripts) {
    $filePath = Join-Path "$baseDir\scripts" $sc
    Assert-Test -Description "Script file exists: $sc" -Condition (Test-Path $filePath)
}

$expectedQueries = @(
    "dashboard_queries.sql",
    "geographical_queries.sql",
    "emergency_queries.sql",
    "analytics_queries.sql"
)
foreach ($qry in $expectedQueries) {
    $filePath = Join-Path "$baseDir\queries" $qry
    Assert-Test -Description "Query library file exists: $qry" -Condition (Test-Path $filePath)
}

Assert-Test -Description "Seed dataset exists (seeds/demo_data.sql)" -Condition (Test-Path "$baseDir\seeds\demo_data.sql")
Assert-Test -Description "Docker Compose file exists (docker-compose.yml)" -Condition (Test-Path "$baseDir\docker-compose.yml")
Assert-Test -Description "Environment example file exists (.env.example)" -Condition (Test-Path "$baseDir\.env.example")
Assert-Test -Description "Master README exists (README.md)" -Condition (Test-Path "$baseDir\README.md")

# =============================================================================
# TEST SUITE 2: DDL SYNTAX & TABLE DEFINITIONS ANALYSIS
# =============================================================================
Write-Host "`n[Suite 2] DDL Schema & Table Extraction Analysis" -ForegroundColor Yellow

$expectedTables = @(
    "roles", "users", "user_roles", "user_sessions", "emergency_contacts",
    "vulnerability_categories", "assistance_requirements", "vulnerable_persons",
    "caregiver_relationships", "person_assistance_requirements", "person_emergency_contacts",
    "geographical_regions", "affected_zones", "shelters", "shelter_capacity",
    "weather_event_types", "weather_observations", "weather_alerts", "weather_alert_regions",
    "risk_scoring_rules", "risk_assessments", "risk_assessment_factors",
    "emergency_categories", "emergency_cases", "emergency_case_updates",
    "case_assignments", "case_attachments",
    "response_teams", "response_team_members", "response_team_locations", "team_availability",
    "device_tokens", "notifications", "notification_recipients", "notification_delivery_logs",
    "audit_logs", "consent_records", "access_logs"
)

$allSql = ""
Get-ChildItem "$baseDir\migrations\*.sql" | Sort-Object Name | ForEach-Object {
    $allSql += (Get-Content $_.FullName -Raw) + "`n"
}

$createdTables = [regex]::Matches($allSql, "CREATE TABLE (IF NOT EXISTS )?([a-zA-Z0-9_]+)", "IgnoreCase") | 
    ForEach-Object { $_.Groups[2].Value.ToLower() } | Select-Object -Unique

foreach ($tbl in $expectedTables) {
    $found = $createdTables -contains $tbl.ToLower()
    Assert-Test -Description "Table '$tbl' created in Flyway migrations" -Condition $found
}

# =============================================================================
# TEST SUITE 3: POSTGIS SPATIAL TYPES & GIST INDEXES
# =============================================================================
Write-Host "`n[Suite 3] PostGIS Extension & Spatial Indexes" -ForegroundColor Yellow

Assert-Test -Description "PostGIS extension creation statement present" -Condition ($allSql -match 'CREATE EXTENSION IF NOT EXISTS "postgis"')
Assert-Test -Description "Point geometry columns defined with SRID 4326" -Condition ($allSql -match 'GEOMETRY\(Point, 4326\)')
Assert-Test -Description "MultiPolygon geometry column defined for administrative boundaries" -Condition ($allSql -match 'GEOMETRY\(MultiPolygon, 4326\)')
Assert-Test -Description "Polygon geometry column defined for affected hazard zones" -Condition ($allSql -match 'GEOMETRY\(Polygon, 4326\)')

$expectedGistIndexes = @(
    "idx_vulnerable_persons_location",
    "idx_geographical_regions_boundary",
    "idx_geographical_regions_centroid",
    "idx_affected_zones_boundary",
    "idx_shelters_location",
    "idx_emergency_cases_location",
    "idx_response_team_locations_location"
)
foreach ($idx in $expectedGistIndexes) {
    $hasIndex = $allSql -match $idx
    Assert-Test -Description "GiST Spatial index defined: $idx" -Condition $hasIndex
}

# =============================================================================
# TEST SUITE 4: DATA INTEGRITY & DEMONSTRATION SEED VALIDATION
# =============================================================================
Write-Host "`n[Suite 4] Demonstration Dataset Counts & Integrity Verification" -ForegroundColor Yellow

$demoSql = Get-Content "$baseDir\seeds\demo_data.sql" -Raw

# Count users
$userMatches = [regex]::Matches($demoSql, "\('10000000-0000-0000-0000-[0-9a-f]{12}'", "IgnoreCase")
Assert-Test -Description "At least 20 sample users seeded" -Condition ($userMatches.Count -ge 20) -Details "Found $($userMatches.Count) user records"

# Count vulnerable persons
$vulnMatches = [regex]::Matches($demoSql, "\('20000000-0000-0000-0000-[0-9a-f]{12}'", "IgnoreCase")
Assert-Test -Description "At least 30 vulnerable persons seeded" -Condition ($vulnMatches.Count -ge 30) -Details "Found $($vulnMatches.Count) vulnerable person records"

# Count regions in Karnataka
$regionMatches = [regex]::Matches($demoSql, "'Karnataka'", "IgnoreCase")
Assert-Test -Description "Karnataka regions seeded" -Condition ($regionMatches.Count -ge 5) -Details "Found $($regionMatches.Count) Karnataka references"

# Count emergency cases
$caseMatches = [regex]::Matches($demoSql, "'EMG-2026-[0-9]{4}'", "IgnoreCase")
Assert-Test -Description "At least 10 emergency cases seeded" -Condition ($caseMatches.Count -ge 10) -Details "Found $($caseMatches.Count) emergency tickets"

# Count response teams
$teamMatches = [regex]::Matches($demoSql, "'TM-[A-Z0-9-]+'", "IgnoreCase")
Assert-Test -Description "At least 3 operational response teams seeded" -Condition ($teamMatches.Count -ge 3) -Details "Found $($teamMatches.Count) response team codes"

# Verify fictional data disclaimer
$hasDisclaimer = $demoSql -match "ALL DATA GENERATED IS DEMONSTRATION DATA ONLY"
Assert-Test -Description "Demonstration dataset disclaimer prominently present" -Condition $hasDisclaimer

# Verify Soft Delete Protection
Assert-Test -Description "Soft-delete (deleted_at) implemented on users table" -Condition ($allSql -match 'deleted_at TIMESTAMPTZ NULL')
Assert-Test -Description "ON DELETE RESTRICT protects emergency_cases from user deletion" -Condition ($allSql -match 'reporter_id UUID NOT NULL REFERENCES users\(user_id\) ON DELETE RESTRICT')

# =============================================================================
# TEST SUITE 5: DASHBOARD & SPATIAL QUERIES VERIFICATION
# =============================================================================
Write-Host "`n[Suite 5] Authority Dashboard SQL Queries Coverage" -ForegroundColor Yellow

$allQueries = ""
Get-ChildItem "$baseDir\queries\*.sql" | ForEach-Object {
    $allQueries += (Get-Content $_.FullName -Raw) + "`n"
}

$requiredQueryPatterns = @(
    @{ Name = "1. Total registered vulnerable individuals"; Pattern = "COUNT\(\*\).*FROM vulnerable_persons" },
    @{ Name = "2. Total high-risk individuals"; Pattern = "la\.risk_classification = 'HIGH'" },
    @{ Name = "3. Region-wise vulnerable population"; Pattern = "GROUP BY gr\.region_id" },
    @{ Name = "4. Category-wise population distribution"; Pattern = "GROUP BY vc\.category_id" },
    @{ Name = "5. People affected by weather alert"; Pattern = "(?s)weather_alerts wa.*weather_alert_regions war" },
    @{ Name = "6. People inside affected geographical boundary"; Pattern = "ST_Within\(vp\.location, az\.boundary\)" },
    @{ Name = "7. Active weather warnings"; Pattern = "CURRENT_TIMESTAMP BETWEEN wa\.start_time AND wa\.expiration_time" },
    @{ Name = "8. Pending emergency cases"; Pattern = "ec\.current_status IN \('REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'\)" },
    @{ Name = "9. High-priority emergency cases"; Pattern = "ec\.priority IN \('CRITICAL', 'HIGH'\)" },
    @{ Name = "10. Emergency cases assigned to response team"; Pattern = "ca\.assignment_status = 'ACTIVE'" },
    @{ Name = "11. Number of resolved cases"; Pattern = "current_status = 'RESOLVED'" },
    @{ Name = "12. Average emergency response time"; Pattern = "AVG\(EXTRACT\(EPOCH FROM \(ec\.assigned_at - ec\.reported_at\)\)" },
    @{ Name = "13. Risk distribution by region"; Pattern = "FILTER \(WHERE lpr\.risk_classification = 'HIGH'\)" },
    @{ Name = "14. Nearby shelters"; Pattern = "(?s)ST_DWithin\(.*s\.location::geography" },
    @{ Name = "15. Notification delivery statistics"; Pattern = "delivery_status = 'DELIVERED'" }
)

foreach ($item in $requiredQueryPatterns) {
    $matched = $allQueries -match $item.Pattern
    Assert-Test -Description "Query verified: $($item.Name)" -Condition $matched
}

# =============================================================================
# SUMMARY REPORT
# =============================================================================
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "                    FINAL VERIFICATION REPORT                    " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Total Tests Run : $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "  Passed Tests    : $testsPassed" -ForegroundColor Green
Write-Host "  Failed Tests    : $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "DarkGreen" } else { "Red" })

if ($testsFailed -eq 0) {
    Write-Host "`n  ALL ARCHITECTURAL & DATA INTEGRITY TESTS PASSED SUCCESSFULLY!  " -ForegroundColor Green
    Write-Host "=================================================================`n" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "`n  SOME TESTS FAILED. PLEASE REVIEW LOG ABOVE." -ForegroundColor Red
    Write-Host "=================================================================`n" -ForegroundColor Cyan
    exit 1
}
