# Extreme Weather Vulnerability Identification & Emergency Response System
## Master Database Architecture & PostgreSQL/PostGIS Engine

Production-grade, fully normalized, secure, and PostGIS-optimized spatial database supporting:
1. **React Native + Expo** mobile application for citizens, caregivers, and field volunteers.
2. **React.js** web-based authority dashboard for district disaster management officials.
3. **Java 21 + Spring Boot 3.x** microservices backend with Hibernate 6 and Spring Data JPA.

---

## 1. System Architecture & Features

- **PostgreSQL 16+ & PostGIS 3.4+**: Native WGS 84 spatial types (`Point`, `Polygon`, `MultiPolygon`) with GiST spatial indexing for real-time hazard geofencing and proximity triage.
- **UUID Primary Keys**: `gen_random_uuid()` throughout all 29 relational tables to enable safe offline mobile sync and eliminate sequential enumeration risks.
- **Flyway Migrations**: 10 sequential, reproducible database migrations (`V1` to `V10`).
- **Complete Normalization (3NF/BCNF)**: Clean domain decoupling across 9 modules without duplicate data.
- **Referential Protection & Soft-Delete**: `ON DELETE RESTRICT` protects critical distress tickets and legal audit logs from accidental cascade wipeout when a user profile is removed.
- **Selective JSONB**: Flexible metadata for unparsed sensor feeds, algorithmic scoring parameters, and SMS/Push provider webhook responses.
- **Enterprise Audit & DPDP Compliance**: Complete consent management compliant with the Indian Digital Personal Data Protection (DPDP) Act and confidential record access logs.

---

## 2. Directory Structure

```text
database/
├── docker-compose.yml              # Portable Docker Compose configuration
├── .env.example                    # Environment variable template
├── .env                            # Local development configuration
├── README.md                       # Master operational documentation
│
├── migrations/                     # Sequential Flyway database migrations
│   ├── V1__create_user_management.sql
│   ├── V2__create_vulnerability_management.sql
│   ├── V3__create_geographical_management.sql
│   ├── V4__create_weather_management.sql
│   ├── V5__create_risk_assessment.sql
│   ├── V6__create_emergency_management.sql
│   ├── V7__create_response_team_management.sql
│   ├── V8__create_notification_management.sql
│   ├── V9__create_audit_and_security.sql
│   └── V10__create_indexes_and_constraints.sql
│
├── seeds/                          # Synthetic demonstration dataset
│   └── demo_data.sql               # 20 users, 30 vulnerable persons, 5 Karnataka regions, 10 cases
│
├── queries/                        # Tested query library for the Authority Dashboard
│   ├── dashboard_queries.sql       # High-speed KPIs, pending cases, and active alerts
│   ├── geographical_queries.sql    # Spatial intersections, hazard zones, and nearby shelters
│   ├── emergency_queries.sql       # Dispatch assignments, triage queues, and case timeline
│   └── analytics_queries.sql       # Demographic distributions, response SLAs, and delivery stats
│
├── documentation/                  # Technical handoff & architecture specifications
│   ├── ER_DIAGRAM.md               # Complete Mermaid entity-relationship diagram
│   ├── DATABASE_SCHEMA.md          # Comprehensive technical data dictionary
│   ├── BACKEND_INTEGRATION.md      # Java 21 / Spring Boot 3 / Hibernate Spatial guide
│   ├── TABLE_RELATIONSHIPS.md      # Integrity rules, cardinalities, and cascade matrix
│   └── HANDOVER_DOCUMENT.md        # Official engineering handover specification
│
└── scripts/                        # Automation, backup, and testing scripts
    ├── init-db.sh                  # Docker entrypoint initialization script
    ├── init_complete_database.sql  # Single-file consolidated database DDL script
    ├── setup.sh                    # Linux/macOS turnkey automated setup script
    ├── setup.ps1                   # Windows turnkey automated setup script
    ├── backup.sh                   # Linux/macOS compressed pg_dump backup
    ├── restore.sh                  # Linux/macOS gzip database restore
    ├── backup.ps1                  # Windows PowerShell database backup
    ├── restore.ps1                 # Windows PowerShell database restore
    └── test_runner.ps1             # Schema verification and integrity test suite
```

---

## 3. Independent Laptop Quick-Start

The database is completely portable and does not depend on another developer's local environment or hardcoded IP addresses.

### Option A: Running via Docker Compose (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Start PostgreSQL 16 with PostGIS:
   ```bash
   docker compose up -d db
   ```
3. Docker will automatically initialize the database, execute all Flyway migrations (`V1` to `V10`), and load the demonstration seeds from `scripts/init-db.sh`.
4. To run Flyway independently:
   ```bash
   docker compose run --rm flyway
   ```

### Option B: Running Against Existing PostgreSQL 16 Server

1. Create the database:
   ```sql
   CREATE DATABASE extreme_weather_db;
   ```
2. Connect and run migrations in sequential order:
   ```bash
   psql -U postgres -d extreme_weather_db -f migrations/V1__create_user_management.sql
   psql -U postgres -d extreme_weather_db -f migrations/V2__create_vulnerability_management.sql
   psql -U postgres -d extreme_weather_db -f migrations/V3__create_geographical_management.sql
   psql -U postgres -d extreme_weather_db -f migrations/V4__create_weather_management.sql
   psql -U postgres -d extreme_weather_db -f migrations/V5__create_risk_assessment.sql
   psql -U postgres -d extreme_weather_db -f migrations/V6__create_emergency_management.sql
   psql -U postgres -d extreme_weather_db -f migrations/V7__create_response_team_management.sql
   psql -U postgres -d extreme_weather_db -f migrations/V8__create_notification_management.sql
   psql -U postgres -d extreme_weather_db -f migrations/V9__create_audit_and_security.sql
   psql -U postgres -d extreme_weather_db -f migrations/V10__create_indexes_and_constraints.sql
   ```
3. Load demonstration seeds:
   ```bash
   psql -U postgres -d extreme_weather_db -f seeds/demo_data.sql
   ```

---

## 4. Environment Variables Configuration

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` | Database host name / container alias |
| `DB_PORT` | `5432` | PostgreSQL listening port |
| `DB_NAME` | `extreme_weather_db` | Primary database name |
| `DB_USERNAME` | `postgres` | Database admin user |
| `DB_PASSWORD` | `CHANGE_ME` | Database password |
| `POSTGRES_PORT`| `5432` | Exposed host port for Docker |

---

## 5. Backup & Disaster Recovery

### Compressed Database Backup
- **Linux/macOS**:
  ```bash
  ./scripts/backup.sh ./backups
  ```
- **Windows PowerShell**:
  ```powershell
  .\scripts\backup.ps1 -BackupDir .\backups
  ```

### Database Restoration
- **Linux/macOS**:
  ```bash
  ./scripts/restore.sh ./backups/extreme_weather_db_backup_YYYYMMDD_HHMMSS.sql.gz
  ```
- **Windows PowerShell**:
  ```powershell
  .\scripts\restore.ps1 -BackupFile .\backups\extreme_weather_db_backup_YYYYMMDD_HHMMSS.sql
  ```

---

## 6. Verification and Automated Testing

Execute the automated PowerShell verification suite to validate syntax, foreign keys, table counts, and demonstration datasets:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test_runner.ps1
```
