# Extreme Weather Vulnerability Identification & Emergency Response System
## Master Unified Project: Java 21 Spring Boot + PostgreSQL PostGIS + React Authority Dashboard + React Native Mobile App

Production-grade, fully integrated municipal extreme weather vulnerability identification, risk assessment, and emergency dispatch operations platform.

---

## 1. System Applications & Unified Directory Layout

```
extreme-weather-response/
|
|-- backend/                       # Centralized Java 21 + Spring Boot 3.3.5 Backend Service
|   |-- src/main/java/             # Security, REST Controllers, Repositories, Services, Entities
|   |-- src/main/resources/        # application.yml, application-dev.yml
|   |   |-- db/migration/          # 5 Sequential Non-Destructive Flyway Migrations (V1 to V5)
|   |-- src/test/java/             # 20 Automated Integration & Workflow Tests
|   |-- pom.xml                    # Maven build file with Hibernate Spatial & PostGIS
|
|-- database/                      # Turnkey Database Handover Source Package
|   |-- migrations/                # Standalone reference Flyway SQL migrations (V1 to V10)
|   |-- seeds/                     # Synthetic Karnataka demonstration dataset (demo_data.sql)
|   |-- queries/                   # Production analytics, GIS, and dashboard query catalog
|   |-- documentation/             # ER diagrams, Data Dictionary, Schema contracts
|   |-- scripts/                   # Cross-platform backup/restore and setup scripts
|   |-- docker-compose.yml         # Containerized PostgreSQL 16 + PostGIS 3.4 deployment
|   |-- .env.example               # Clean database environment configuration
|
|-- authority-dashboard/           # Web-based Disaster Emergency Operations Command Center
|   |-- src/                       # React 18, Vite, TypeScript, Tailwind CSS, Leaflet, Recharts
|   |-- package.json
|   |-- .env                       # VITE_API_BASE_URL=http://localhost:8080/api/v1
|
|-- mobile-app/                    # "EXTREME WEATHER SAFETY" Mobile Application
|   |-- app/                       # React Native, Expo SDK 51, Expo Router, TypeScript
|   |-- package.json
|   |-- .env                       # EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
|
|-- shared/                        # Strict API Contracts, DTOs & Simulation Models
|   |-- api-contracts/             # REST Endpoints & seed dataset mirroring Spring Flyway V2
|   |-- types/                     # Canonical TypeScript domain types
|
|-- start-all.bat                  # One-click Windows orchestrator to launch all 3 tiers
|-- run-backend.cmd                # Dedicated runner for Java Spring Boot backend
|-- test-backend.cmd               # Test suite runner (20 tests passed)
|-- run-dashboard.cmd              # Dedicated runner for React Authority Dashboard
|-- run-mobile.cmd                 # Dedicated runner for React Native Mobile Application
```

---

## 2. Integrated Database Architecture (PostgreSQL 16 + PostGIS 3.4)

The database implementation unites the 38-table relational model from the database handover package with the Java Spring Boot persistence model via sequential Flyway versioned migrations:

1. **`V1__init_schema.sql`**: Baseline tables (`roles`, `users`, `vulnerable_persons`, `caregiver_relationships`, `geographical_regions`, `weather_observations`, `weather_alerts`, `risk_scoring_rules`, `risk_assessments`, `response_teams`, `emergency_cases`, `case_assignments`, `notifications`, `notification_delivery_logs`, `audit_logs`).
2. **`V2__seed_demo_data.sql`**: Demonstrator accounts (`admin`, `officer_raj`, `caregiver_mary`, `citizen_john`, `volunteer_sarah`), response teams, and initial regional data.
3. **`V3__integrate_handover_schema.sql`**: Seamlessly adds UUIDs (`DEFAULT gen_random_uuid() UNIQUE`) across all entities, plus 23 missing handover tables:
   - `user_roles`, `user_sessions`, `emergency_contacts`
   - `vulnerability_categories`, `assistance_requirements`, `person_assistance_requirements`, `person_emergency_contacts`
   - `affected_zones`, `shelters`, `shelter_capacity`
   - `weather_event_types`, `weather_alert_regions`, `risk_assessment_factors`
   - `emergency_categories`, `emergency_case_updates`, `case_attachments`
   - `response_team_members`, `response_team_locations`, `team_availability`
   - `device_tokens`, `notification_recipients`
   - `consent_records` (DPDP compliance), `access_logs` (PII dossier surveillance)
4. **`V4__create_advanced_indexes_and_constraints.sql`**:
   - 6 PostGIS GiST spatial indexes (`idx_vulnerable_persons_location`, `idx_geographical_regions_boundary`, etc.)
   - Foreign key indexing on all 38 tables
   - High-performance composite dashboard triage indexes (`idx_emergency_cases_dashboard_triage`, `idx_risk_assessments_dashboard_stats`)
5. **`V5__seed_handover_extended_data.sql`**:
   - Master vulnerability categories with risk baseline weights
   - Medical/accessibility assistance requirements catalog
   - Extreme meteorological event classifications
   - Karnataka emergency shelters (Madikeri, Kalaburagi, Malpe Coast, Yelahanka)
   - Dynamic hazard danger zones with PostGIS polygon perimeters

---

## 3. Technology Stack

- **Backend Runtime**: Java 21 / Spring Boot 3.3.5
- **ORM & Data**: Spring Data JPA, Hibernate 6, Hibernate Spatial, JTS Topology Suite 1.19.0
- **Database Migrations**: Flyway 10
- **Database**: PostgreSQL 16+ with PostGIS 3.4+
- **API Documentation**: OpenAPI 3 / Swagger UI (`/swagger-ui.html`)
- **Authority Dashboard**: React 18, Vite, TypeScript, Tailwind CSS, Leaflet, Recharts
- **Mobile Client**: React Native, Expo SDK 51, Expo Router, TypeScript

---

## 4. Exact Commands to Start the Entire Application

### Option A: Complete Turnkey Launcher (Windows)
Double-click or run from PowerShell:
```powershell
.\start-all.bat
```
This automatically launches all three tiers in dedicated console windows with appropriate startup sequencing and health delays.

### Option B: Manual Service-by-Service Startup

#### 1. PostgreSQL Database (Docker or Native)
If using Docker:
```powershell
cd database
docker compose up -d
```
Default credentials:
- `DB_HOST`: `localhost`
- `DB_PORT`: `5432`
- `DB_NAME`: `extreme_weather_db`
- `DB_USERNAME`: `postgres`
- `DB_PASSWORD`: `postgres`

#### 2. Java Spring Boot Backend
```powershell
.\run-backend.cmd
# Or directly with Maven:
cd backend
mvn spring-boot:run
```
- Available at: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- Health check: `http://localhost:8080/api/v1/auth/me`

#### 3. React Authority Dashboard
```powershell
.\run-dashboard.cmd
# Or directly with npm:
cd authority-dashboard
npm run dev
```
- Web dashboard accessible at: `http://localhost:5173`

#### 4. React Native Mobile Application
```powershell
.\run-mobile.cmd
# Or directly with Expo:
cd mobile-app
npx expo start
```
- Metro bundler accessible at: `http://localhost:8081`
- Press `w` to open in browser web view or scan QR code via Expo Go on physical device.

---

## 6. Cloud Deployment Guide (Render & Cloud PostgreSQL/PostGIS)

VULNEX includes a turnkey infrastructure-as-code blueprint in `deployment/render.yaml` to deploy the complete system to Render:

### Architecture
- **Backend**: Containerized Java 21 LTS + Spring Boot 3.3.5 Docker service (`deployment/Dockerfile`).
- **Web Portal**: Static site hosting the responsive React 18 / Vite Citizen Safety Portal & Disaster Command Centre.
- **Database**: PostgreSQL 16 + PostGIS 3.4 for spatial distance calculations and hazard impact assessment.

### Quick Deploy to Render:
1. Fork or push this repository to GitHub (`https://github.com/krishimarga01/vulnex`).
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** $\to$ **Blueprint**.
4. Connect your `vulnex` GitHub repository.
5. Render reads `deployment/render.yaml` and provisions the backend, database, and web frontend automatically!

### Hackathon Demo Logins:
- **Disaster Authority**: `officer.raj@disasterresponse.gov` / `Password@123`
- **Citizen Portal**: `john.citizen@example.com` / `Password@123`
- **Admin Settings**: `admin@disasterresponse.gov` / `Password@123`
- **Caregiver / Family**: `mary.caregiver@example.com` / `Password@123`


To run the complete automated test suite (20 tests covering migrations, schema validation, GIS spatial operations, risk engine, security, and the complete E2E emergency lifecycle workflow):

```powershell
.\test-backend.cmd
# Or directly:
cd backend
mvn clean test
```

**Verification Results:**
- `Tests run: 20`
- `Failures: 0`
- `Errors: 0`
- `Skipped: 0`
- `Result: BUILD SUCCESS`
