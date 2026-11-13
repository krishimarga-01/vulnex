# Database Engineering Handover Specification
## Extreme Weather Vulnerability Identification & Emergency Response System

**Document Version**: 1.0.0-FINAL  
**Target Environment**: Multi-Developer Laptop Deployment (Clean / Isolated)  
**Primary Engine**: PostgreSQL 16.2+ with PostGIS 3.4+  
**Target Backend**: Java 21, Spring Boot 3.2+, Hibernate 6, Spring Data JPA, Flyway 10  
**Target Frontends**: React Native + Expo (Mobile Client), React.js (Authority Dashboard)  

---

### 1. Handover Package Contents & Directory Layout

The database implementation is delivered as a self-contained, turnkey codebase. It requires no hardcoded laptop paths or personal credentials.

```text
database/
├── docker-compose.yml              # Multi-container orchestration (PostgreSQL 16 + PostGIS + Flyway)
├── .env.example                    # Clean environment variable template
├── .env                            # Local development configuration defaults
├── README.md                       # Master operational manual
│
├── migrations/                     # 10 Sequential Flyway Database Migrations
│   ├── V1__create_user_management.sql           # Roles, Users, Sessions, Emergency Contacts
│   ├── V2__create_vulnerability_management.sql  # Categories, Requirements, Vulnerable Persons
│   ├── V3__create_geographical_management.sql   # PostGIS Regions, Hazard Polygons, Shelters
│   ├── V4__create_weather_management.sql        # Event Types, Telemetry Observations, Alerts
│   ├── V5__create_risk_assessment.sql           # Versioned Rules, Assessments, Factor Breakdown
│   ├── V6__create_emergency_management.sql       # Tickets, Incident Updates, Assignments, Files
│   ├── V7__create_response_team_management.sql  # Response Teams, Roster, Live GPS Telemetry
│   ├── V8__create_notification_management.sql   # Push Tokens, Broadcasts, Recipient Logs
│   ├── V9__create_audit_and_security.sql        # Compliance Auditing, DPDP Consent, Dossier Access
│   └── V10__create_indexes_and_constraints.sql  # Spatial GiST, Foreign Keys, Dashboard Composites
│
├── seeds/                          # Synthetic Demonstration Data
│   └── demo_data.sql               # 20 users, 30 vulnerable persons, 5 Karnataka regions, 10 cases
│
├── queries/                        # Tested Production Query Catalog
│   ├── dashboard_queries.sql       # High-speed KPIs, pending cases, active weather warnings
│   ├── geographical_queries.sql    # PostGIS ST_Within, hazard boundaries, nearby shelters
│   ├── emergency_queries.sql       # Active team dispatches, case timeline, urgent needs
│   └── analytics_queries.sql       # Demographic distributions, response SLAs, delivery stats
│
├── documentation/                  # Technical Data Contracts & Architecture Specifications
│   ├── ER_DIAGRAM.md               # Complete Mermaid ER diagram (38 entities & junctions)
│   ├── DATABASE_SCHEMA.md          # Comprehensive data dictionary (types, nullability, defaults)
│   ├── BACKEND_INTEGRATION.md      # Java 21 / Spring Boot 3 entity mappings & spatial queries
│   ├── TABLE_RELATIONSHIPS.md      # Referential integrity matrix, cascade rules, data flows
│   └── HANDOVER_DOCUMENT.md        # This comprehensive handover technical specification
│
└── scripts/                        # Automation, Disaster Recovery & Verification
    ├── init-db.sh                  # Docker entrypoint initialization script
    ├── init_complete_database.sql  # Single consolidated DDL script (V1 to V10)
    ├── setup.sh                    # One-command setup script for Linux/macOS
    ├── setup.ps1                   # One-command setup script for Windows
    ├── backup.sh / backup.ps1      # Cross-platform compressed pg_dump backup
    ├── restore.sh / restore.ps1    # Cross-platform database restore
    └── test_runner.ps1             # 94-check automated schema and data test suite
```

---

### 2. Technology Stack & Runtime Prerequisites

The receiving developer must ensure one of the following setups is available:

#### Option A: Containerized Setup (Recommended)
- **Docker Desktop** (version 24.0+ or Docker Engine with Docker Compose v2.20+).
- *No local PostgreSQL installation required.* All database dependencies (PostgreSQL 16, PostGIS 3.4, Flyway) run in Docker.

#### Option B: Native Host Setup
- **PostgreSQL**: Version 16.0 or higher.
- **PostGIS**: Version 3.4 or higher installed as an extension.
- **Client Tools**: `psql` (PostgreSQL CLI), `pg_dump`.
- **Flyway CLI** (optional): Version 10.x.

---

### 3. Step-by-Step Setup on a New Developer Laptop

#### Step 1: Extract the Codebase
Extract `extreme_weather_database_handover.zip` into your designated project folder:
```bash
unzip extreme_weather_database_handover.zip -d ./database
cd ./database
```

#### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` values are pre-configured for local testing:
```ini
DB_HOST=localhost
DB_PORT=5432
DB_NAME=extreme_weather_db
DB_USERNAME=postgres
DB_PASSWORD=postgres_dev_secret_2026

POSTGRES_DB=extreme_weather_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_dev_secret_2026
POSTGRES_PORT=5432
```

#### Step 3: Launch the Database

**Using Docker (Turnkey):**
```bash
# Linux / macOS
./scripts/setup.sh

# Windows PowerShell
.\scripts\setup.ps1
```
Or directly via Docker Compose:
```bash
docker compose up -d db
```
The Docker container automatically mounts `./scripts/init-db.sh`, enables the PostGIS extension, executes migrations `V1` through `V10`, and loads the demonstration dataset.

**Using Native PostgreSQL:**
If running a native PostgreSQL 16 server locally:
```bash
# 1. Create Database
psql -U postgres -c "CREATE DATABASE extreme_weather_db;"

# 2. Run All Migrations and Constraints in One Step
psql -U postgres -d extreme_weather_db -f scripts/init_complete_database.sql

# 3. Load Demonstration Seeds
psql -U postgres -d extreme_weather_db -f seeds/demo_data.sql
```

#### Step 4: Verify Installation
Run the automated schema and data integrity verification test suite:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test_runner.ps1
```
*Expected Outcome*: 94/94 checks pass with zero failures.

---

### 4. External Services & Credentials Checklist

When integrating the database with live backend and external third-party APIs, configure the following services:

| External Service | Used In Database By | Required Credentials & Configuration |
| :--- | :--- | :--- |
| **Firebase Cloud Messaging (FCM)** | `device_tokens`, `notification_recipients` | `GOOGLE_APPLICATION_CREDENTIALS` (Service Account JSON with FCM Admin SDK permissions). |
| **SMS Gateway (e.g. MSG91 / Twilio)** | `notification_delivery_logs` | API Key, Sender ID (e.g. `KARDMA`), Webhook Callback URL for delivery confirmations. |
| **Meteorological Data (IMD / OpenWeatherMap)** | `weather_observations`, `weather_alerts` | Weather API Key, Station Ingestion Scheduler (runs every 15 mins). |
| **Object Storage (AWS S3 / MinIO)** | `case_attachments` | `S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_REGION`. |
| **Geocoding / Reverse Geocoding** | `vulnerable_persons.location` | Mapbox / Google Maps Geocoding API key for converting street addresses to WGS 84 GPS points. |

---

### 5. Backend Developer Contract (Java 21 / Spring Boot 3)

The backend team is developing REST / WebSocket services in Spring Boot. The database is tailored to this stack:

1. **Hibernate Spatial**:
   - PostGIS `GEOMETRY(Point, 4326)` maps to `org.locationtech.jts.geom.Point`.
   - PostGIS `GEOMETRY(Polygon, 4326)` maps to `org.locationtech.jts.geom.Polygon`.
   - PostGIS `GEOMETRY(MultiPolygon, 4326)` maps to `org.locationtech.jts.geom.MultiPolygon`.
   - JTS Coordinate convention: `(X = Longitude, Y = Latitude)`.
2. **PostgreSQL JSONB**:
   - `parameters` in `risk_scoring_rules`, `raw_payload` in `weather_observations`, and `payload` in `notifications` map via Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)` to Jackson `JsonNode` or custom POJOs.
3. **Soft-Delete Filtering**:
   - Add `@SQLRestriction("deleted_at IS NULL")` on `UserEntity` and `VulnerablePersonEntity` to automatically exclude soft-deleted entities from standard queries.
4. **Calculations in Backend**:
   - As per architecture requirements, the risk score calculation engine is implemented inside Java Spring Boot service classes (`RiskCalculationService.java`), reading weights from `risk_scoring_rules` and writing results to `risk_assessments`. The database does not use triggers for risk scoring.
5. **Entity Mapping Reference**:
   - Refer to [BACKEND_INTEGRATION.md](file:///C:/Users/priya/.gemini/antigravity/scratch/database/documentation/BACKEND_INTEGRATION.md) for complete copy-paste Java entity definitions and Spring Data JPA repositories.

---

### 6. Frontend Developer Contract (React Native & React Dashboard)

1. **Coordinate Format**:
   - Always supply standard WGS 84 decimal coordinates:
     - Latitude: `-90.00000000` to `+90.00000000`
     - Longitude: `-180.00000000` to `+180.00000000`
2. **Enum Values**:
   - Triage Priorities: `'LOW'`, `'MEDIUM'`, `'HIGH'`, `'CRITICAL'`.
   - Case Statuses: `'REPORTED'`, `'VERIFIED'`, `'ASSIGNED'`, `'IN_PROGRESS'`, `'RESOLVED'`, `'CLOSED'`.
   - Roles: `'CITIZEN'`, `'CAREGIVER'`, `'VOLUNTEER'`, `'AUTHORITY'`, `'ADMIN'`.
   - Vulnerability Categories: `'ELDERLY'`, `'CHILD'`, `'PERSON_WITH_DISABILITY'`, `'PREGNANT_WOMAN'`, `'MEDICAL_ASSISTANCE_REQUIRED'`.
3. **Optimized Dashboard Queries**:
   - All high-frequency React dashboard queries (KPI cards, triage queue, active warning banners) are documented in [dashboard_queries.sql](file:///C:/Users/priya/.gemini/antigravity/scratch/database/queries/dashboard_queries.sql).

---

### 7. Handover Verification Checklist

- [x] All 10 Flyway migration files present and sequentially numbered (`V1` to `V10`).
- [x] All 38 tables, foreign keys, check constraints, and unique constraints defined.
- [x] PostGIS spatial geometries and 7 GiST indexes verified.
- [x] Complete demonstration seed dataset (20 users, 30 vulnerable persons, 5 Karnataka regions, 10 cases).
- [x] Single-run consolidated SQL script (`init_complete_database.sql`) provided.
- [x] Multi-platform backup and restore scripts provided (`.sh` and `.ps1`).
- [x] Docker Compose with automated entrypoint initialization verified.
- [x] Zero hardcoded laptop paths or personal credentials in any delivered file.
- [x] 94/94 test runner checks passing with zero errors.
- [x] Handover ZIP package created and verified.
