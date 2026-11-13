# Database Migration Compatibility Audit & Repair Plan
**Project**: `extreme-weather-response`  
**Target Database**: PostgreSQL 16.4 + PostGIS 3.4 (`extreme_weather_db`)  
**Existing State**: 39 Tables, 20 Users, 30 Vulnerable Persons, 5 Roles  
**Audit Mode**: READ-ONLY (Zero DDL/DML executed, zero code or migration files modified)  
**Report Date**: 2026-11-12  

---

## 1. Executive Summary & Root Cause Analysis

### The Failure Event
When starting the Spring Boot backend against the live PostgreSQL database (`extreme_weather_db`), Flyway failed with:
```text
FlywaySqlException: Unable to execute statement
Caused by: org.postgresql.util.PSQLException: ERROR: column "name" of relation "roles" does not exist
Location: db/migration/V2__seed_demo_data.sql (Line 8)
Statement: INSERT INTO roles (name, description) VALUES ('ROLE_ADMIN', 'System Administrator with full access')...
```

### Root Cause
1. **Database Origin**:
   The active PostgreSQL database (`extreme_weather_db`) was initialized by the database engineering team using the handover package (`init_complete_database.sql` / Docker migrations `V1` to `V10` + `demo_data.sql`). It contains an enterprise, normalized **39-table schema** (38 business/handover tables + PostGIS `spatial_ref_sys`) utilizing `UUID` primary keys (`role_id`, `user_id`, `person_id`, etc.) and native PostGIS geometry types.
2. **Backend Migration Mismatch**:
   The backend directory `src/main/resources/db/migration/` contains five migrations (`V1` to `V5`) authored against an early, simplified 11-table schema using `BIGSERIAL` (Long) integer IDs, flat string columns (`roles.name`, `users.username`, `users.role`), and missing 27 relational tables.
3. **The Flyway Baseline Collision**:
   Because `spring.flyway.baseline-on-migrate: true` was enabled with the default baseline version of `1`, Flyway inspected the pre-populated database, recorded a version `1` baseline in `flyway_schema_history`, and immediately attempted to apply the next script in the classpath: `V2__seed_demo_data.sql`.
4. **Immediate Crash**:
   `V2__seed_demo_data.sql` attempted to run `INSERT INTO roles (name, description) VALUES ('ROLE_ADMIN', ...)`. In the actual database:
   - The column is named **`role_name`**, not `name`.
   - The primary key is **`role_id UUID`**, not `id BIGINT`.
   - The check constraint requires `('CITIZEN', 'CAREGIVER', 'VOLUNTEER', 'AUTHORITY', 'ADMIN')`, which forbids `'ROLE_ADMIN'`.
   - The five roles **already exist** in the table!

---

## 2. Comprehensive Migration Inspection (V1 to V5)

### Backend Migrations in `src/main/resources/db/migration/`

| Migration File | Lines | Intended Purpose | Actual Schema Conflict |
|---|---|---|---|
| `V1__init_schema.sql` | 269 | Creates 11 simplified tables with `BIGSERIAL` integer IDs | Never executed against the real DB because Flyway baselined at v1. However, its DDL completely contradicts the real 39-table schema (defines `id BIGSERIAL` everywhere, flat `users.role`, flat `vulnerable_persons.vulnerability_category`). |
| `V2__seed_demo_data.sql` | 144 | Seeds demo roles, users, rules, teams, regions, and cases | **CRASHES IMMEDIATELY**. References non-existent columns (`roles.name`, `users.username`, `vulnerable_persons.vulnerability_category`). Violates check constraints (`ROLE_ADMIN` vs `ADMIN`). Attempts duplicate inserts on already populated tables. |
| `V3__integrate_handover_schema.sql` | 503 | Attempts to retrofit the 38-table handover schema onto V1 | **COMPLETELY BROKEN ASSUMPTION**. Executes `ALTER TABLE roles ADD COLUMN IF NOT EXISTS role_id UUID;` assuming V1 created `roles`. In reality, `role_id UUID` is already the primary key! Attempts to alter non-existent columns. |
| `V4__create_advanced_indexes_and_constraints.sql` | 114 | Creates GiST spatial, FK, and compound triage indexes | Redundant with `V10__create_indexes_and_constraints.sql` already present in the database. |
| `V5__seed_handover_extended_data.sql` | 137 | Seeds categories, requirements, event types, shelters | Redundant with `database/seeds/demo_data.sql`. All UUIDs (`b0000000-...`, `c0000000-...`) are already inserted in the database. |

### Docker / Handover Migrations in `database/migrations/`

The actual database was populated by the 10 migrations specified in the database handover package:
- `V1__create_user_management.sql`: Extensions (`uuid-ossp`, `pgcrypto`, `postgis`), `roles` (UUID `role_id`, `role_name`, `created_at`), `users` (UUID `user_id`, `full_name`, `email`, `phone_number`, `password_hash`, `account_status`, `deleted_at`), `user_roles` junction, `user_sessions`, `emergency_contacts`.
- `V2__create_vulnerability_management.sql`: `vulnerability_categories`, `assistance_requirements`, `vulnerable_persons` (UUID `person_id`, `primary_category_id`, `district`, `location Point`, `verification_status`), `caregiver_relationships`, `person_assistance_requirements`, `person_emergency_contacts`.
- `V3__create_geographical_management.sql`: `geographical_regions` (UUID `region_id`, `boundary MultiPolygon`, `centroid Point`, `latitude`, `longitude`, `region_risk_level`), `affected_zones`, `shelters`, `shelter_capacity`.
- `V4__create_weather_management.sql`: `weather_event_types`, `weather_observations` (with `raw_payload JSONB`), `weather_alerts`, `weather_alert_regions`.
- `V5__create_risk_assessment.sql`: `risk_scoring_rules` (with `parameters JSONB`), `risk_assessments`, `risk_assessment_factors` (with `factor_detail JSONB`).
- `V6__create_emergency_management.sql`: `emergency_categories`, `emergency_cases` (UUID `case_id`, `reporter_id`, `affected_person_id`, `category_id`, `location Point`, `current_status`), `emergency_case_updates`, `case_assignments`, `case_attachments`.
- `V7__create_response_team_management.sql`: `response_teams` (`team_code`, `team_type`, `current_availability`), `response_team_members`, `response_team_locations`, `team_availability`.
- `V8__create_notification_management.sql`: `device_tokens`, `notifications`, `notification_recipients`, `notification_delivery_logs`.
- `V9__create_audit_and_security.sql`: `audit_logs`, `consent_records`, `access_logs`.
- `V10__create_indexes_and_constraints.sql`: Spatial GiST indexes, foreign keys, compound indexes.
- `seeds/demo_data.sql`: Seeded 5 roles, 20 users, 30 vulnerable persons, 5 regions, 4 shelters, 10 emergency cases, response teams.

---

## 3. Schema Comparison & Gap Analysis

| Table Name | Actual PostgreSQL Database Schema | Backend Flyway (V1/V2) Schema | Gap Severity | Primary Incompatibility |
|---|---|---|:---:|---|
| **`roles`** | `role_id UUID PK`<br>`role_name VARCHAR(50) UNIQUE`<br>`description VARCHAR(255)`<br>`created_at TIMESTAMPTZ`<br>*Constraint*: `IN ('CITIZEN', 'CAREGIVER', 'VOLUNTEER', 'AUTHORITY', 'ADMIN')` | `id BIGSERIAL PK`<br>`name VARCHAR(50) UNIQUE`<br>`description VARCHAR(255)` | **CRITICAL (CRASH)** | 1. Column `name` does not exist (actual is `role_name`).<br>2. PK type mismatch (`UUID` vs `BIGINT`).<br>3. Check constraint forbids `'ROLE_ADMIN'`.<br>4. 5 roles already exist. |
| **`users`** | `user_id UUID PK`<br>`full_name VARCHAR(150)`<br>`email VARCHAR(255) UNIQUE`<br>`phone_number VARCHAR(20) UNIQUE`<br>`password_hash VARCHAR(255)`<br>`account_status VARCHAR(30)`<br>`deleted_at TIMESTAMPTZ` | `id BIGSERIAL PK`<br>`username VARCHAR(100) UNIQUE`<br>`email VARCHAR(150) UNIQUE`<br>`password_hash VARCHAR(255)`<br>`full_name VARCHAR(150)`<br>`phone_number VARCHAR(30)`<br>`role VARCHAR(50)`<br>`emergency_contact_name`<br>`emergency_contact_phone`<br>`fcm_token` | **CRITICAL (CRASH)** | 1. Columns `username`, `role`, `emergency_contact_name`, `emergency_contact_phone`, `fcm_token` do not exist.<br>2. PK is `UUID`, not `BIGINT`.<br>3. User authentication in DB is via `email`/`phone`.<br>4. Roles belong in `user_roles` junction.<br>5. 20 users already populated. |
| **`user_roles`** | `user_id UUID FK`<br>`role_id UUID FK`<br>`assigned_at TIMESTAMPTZ` | *Does not exist in V1/V2* | **CRITICAL** | Backend cannot read or assign user roles using single-column mapping. |
| **`vulnerable_persons`** | `person_id UUID PK`<br>`registered_by_user_id UUID FK`<br>`full_name VARCHAR(150)`<br>`age INT`, `age_category VARCHAR(30)`<br>`district VARCHAR(100) NOT NULL`<br>`primary_category_id UUID NOT NULL FK`<br>`geographical_region_id UUID FK`<br>`location GEOMETRY(Point, 4326)`<br>`latitude NUMERIC(10,8)`<br>`longitude NUMERIC(11,8)`<br>`verification_status VARCHAR(30)`<br>`consent_status VARCHAR(30)`<br>`is_active BOOLEAN`, `deleted_at TIMESTAMPTZ` | `id BIGSERIAL PK`<br>`national_id VARCHAR(50)`<br>`full_name VARCHAR(150)`<br>`age INT`, `date_of_birth DATE`<br>`vulnerability_category VARCHAR(50)`<br>`medical_conditions TEXT`<br>`mobility_status VARCHAR(50)`<br>`assistance_requirements TEXT`<br>`contact_number`, `address`<br>`latitude DOUBLE PRECISION`<br>`longitude DOUBLE PRECISION`<br>`caregiver_user_id BIGINT`<br>`current_risk_level`, `current_risk_score` | **CRITICAL (CRASH)** | 1. Missing NOT NULL columns: `district`, `primary_category_id`, `age_category`.<br>2. Phantom columns: `vulnerability_category` (it is an FK), `mobility_status` (in junction table), `caregiver_user_id` (in `caregiver_relationships`).<br>3. PK is `UUID`, not `BIGINT`.<br>4. 30 persons already populated. |
| **`geographical_regions`** | `region_id UUID PK`<br>`region_code VARCHAR(50) UNIQUE`<br>`region_name VARCHAR(100)`<br>`state VARCHAR(100)`, `district VARCHAR(100)`<br>`boundary GEOMETRY(MultiPolygon, 4326) NOT NULL`<br>`centroid GEOMETRY(Point, 4326) NOT NULL`<br>`latitude NUMERIC(10,8)`, `longitude NUMERIC(11,8)`<br>`region_risk_level VARCHAR(20)` | `id BIGSERIAL PK`<br>`name VARCHAR(150)`<br>`region_code VARCHAR(50)`<br>`region_type VARCHAR(50)`<br>`center_latitude DOUBLE`<br>`center_longitude DOUBLE`<br>`boundary_geojson TEXT`<br>`current_risk_level VARCHAR(20)`<br>`active_alert_count INT`, `population INT` | **CRITICAL** | 1. Column `name` does not exist (actual is `region_name`).<br>2. Missing NOT NULL spatial geometries: `boundary` and `centroid`.<br>3. Phantom columns: `population`, `active_alert_count`.<br>4. PK is `UUID`. |
| **`weather_alerts`** | `alert_id UUID PK`<br>`event_type_id UUID FK`<br>`severity VARCHAR(20)`<br>`headline VARCHAR(255)`, `description TEXT`<br>`instruction TEXT`<br>`issued_by_user_id UUID FK`<br>`effective_from TIMESTAMPTZ`<br>`effective_to TIMESTAMPTZ`<br>`is_active BOOLEAN` | `id BIGSERIAL PK`<br>`alert_code VARCHAR(50)`<br>`alert_type VARCHAR(50)`<br>`severity VARCHAR(30)`<br>`headline`, `description`<br>`safety_instructions TEXT`<br>`affected_region_name VARCHAR(150)`<br>`boundary_geojson TEXT`<br>`center_latitude`, `center_longitude`<br>`radius_km DOUBLE`<br>`effective_until TIMESTAMPTZ` | **CRITICAL** | 1. Event type is an FK to `weather_event_types`, not a flat string.<br>2. Affected regions belong in `weather_alert_regions` junction.<br>3. `instruction` vs `safety_instructions`.<br>4. `effective_to` vs `effective_until`. |
| **`emergency_cases`** | `case_id UUID PK`<br>`case_number VARCHAR(30) UNIQUE`<br>`reporter_id UUID FK`<br>`affected_person_id UUID FK`<br>`category_id UUID FK`<br>`description TEXT`<br>`location GEOMETRY(Point, 4326) NOT NULL`<br>`latitude NUMERIC(10,8)`, `longitude NUMERIC(11,8)`<br>`address_details TEXT`<br>`priority VARCHAR(20)`<br>`current_status VARCHAR(30)`<br>`assigned_team_id UUID FK`<br>`resolution_details TEXT` | `id BIGSERIAL PK`<br>`case_number VARCHAR(50)`<br>`reporter_user_id BIGINT`<br>`affected_person_id BIGINT`<br>`emergency_category VARCHAR(50)`<br>`description TEXT`<br>`latitude DOUBLE`, `longitude DOUBLE`<br>`address TEXT`<br>`priority VARCHAR(20)`<br>`status VARCHAR(30)`<br>`assigned_team_id BIGINT` | **CRITICAL** | 1. FK column `reporter_id` vs `reporter_user_id`.<br>2. Category is FK `category_id UUID`, not string `emergency_category`.<br>3. Status column is `current_status`, not `status`.<br>4. Missing mandatory PostGIS `location Point`.<br>5. PK is `UUID`. |
| **`response_teams`** | `team_id UUID PK`<br>`team_code VARCHAR(50) UNIQUE`<br>`team_name VARCHAR(150)`<br>`team_type VARCHAR(50)` (`NDRF`, `SDRF`, etc.)<br>`contact_phone VARCHAR(20)`<br>`contact_email VARCHAR(255)`<br>`base_region_id UUID FK`<br>`current_availability VARCHAR(30)` | `id BIGSERIAL PK`<br>`team_name VARCHAR(150)`<br>`team_type VARCHAR(50)`<br>`contact_phone VARCHAR(30)`<br>`base_location_name VARCHAR(150)`<br>`is_available BOOLEAN`<br>`current_capacity INT` | **CRITICAL** | 1. Missing mandatory NOT NULL column `team_code`.<br>2. Availability is an enum (`AVAILABLE`, `DEPLOYED`, `STANDBY`, `OFF_DUTY`), not a boolean `is_available`.<br>3. Phantom columns: `base_location_name`, `current_capacity`. |
| **`risk_scoring_rules`** | `rule_id UUID PK`<br>`rule_version VARCHAR(30) UNIQUE`<br>`rule_name VARCHAR(150)`<br>`parameters JSONB NOT NULL`<br>`is_active BOOLEAN`<br>`created_by_user_id UUID FK` | `id BIGSERIAL PK`<br>`rule_code VARCHAR(50) UNIQUE`<br>`category VARCHAR(50)`<br>`description VARCHAR(255)`<br>`condition_field VARCHAR(100)`<br>`operator VARCHAR(20)`<br>`threshold_value VARCHAR(100)`<br>`score_weight DOUBLE` | **CRITICAL** | Architectural mismatch: actual DB uses versioned rules with a flexible JSONB configuration document. V1 flattened rules into row-per-condition columns. |
| **`risk_assessments`** | `assessment_id UUID PK`<br>`person_id UUID FK`<br>`weather_alert_id UUID FK`<br>`rule_id UUID FK`<br>`risk_score NUMERIC(5,2)`<br>`risk_classification VARCHAR(20)`<br>`assessment_explanation TEXT`<br>`assessed_at TIMESTAMPTZ` | `id BIGSERIAL PK`<br>`vulnerable_person_id BIGINT`<br>`weather_alert_id BIGINT`<br>`calculated_score DOUBLE`<br>`risk_level VARCHAR(20)`<br>`breakdown_json TEXT`<br>`assessed_at TIMESTAMPTZ`<br>`assessed_by VARCHAR(100)` | **CRITICAL** | 1. FK column `person_id` vs `vulnerable_person_id`.<br>2. `risk_score` vs `calculated_score`.<br>3. `risk_classification` vs `risk_level`.<br>4. Factor breakdowns in DB are normalized in `risk_assessment_factors`, not flat JSON. |
| **27 Handover Tables** | `shelters`, `shelter_capacity`, `affected_zones`, `emergency_contacts`, `user_sessions`, `device_tokens`, `notifications`, `notification_recipients`, `audit_logs`, `consent_records`, `access_logs`, etc. | *Completely omitted from V1/V2 entities* | **HIGH** | Major modules (shelters, audit compliance, DPDP consent, multi-channel dispatch) are unmapped in backend entities. |

---

## 4. Inspection of JPA Entities & Repositories

### Entities (`com.extremeweather.entity.*`)
1. **Primary Key Mismatch**:
   Every single entity (`User`, `Role`, `VulnerablePerson`, `EmergencyCase`, `GeographicalRegion`, `WeatherAlert`, `WeatherObservation`, `ResponseTeam`, `RiskScoringRule`, `RiskAssessment`, `CaregiverRelationship`) is annotated with `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;`.
   - **Database Reality**: All primary keys are `UUID` generated via `gen_random_uuid()`.
   - **Impact**: Any JPA read or write operation will throw `PSQLException: column "id" does not exist` or `DataException: invalid input syntax for type bigint: "a0000000-0000-0000-0000-000000000001"`.
2. **Missing `user_roles` Many-to-Many**:
   `User.java` has `@Enumerated(EnumType.STRING) private RoleEnum role;` mapped to a single column `role`.
   - **Database Reality**: No `role` column exists on `users`. The database uses `@ManyToMany` table `user_roles (user_id, role_id)`.
3. **Missing PostGIS JTS Geometries**:
   `GeographicalRegion.java` stores `boundaryGeoJson` as a plain String.
   - **Database Reality**: Requires `org.locationtech.jts.geom.MultiPolygon` and `org.locationtech.jts.geom.Point` mapped via Hibernate Spatial (`geometry(MultiPolygon, 4326)`).
4. **Soft Delete Handling**:
   The actual database enforces soft deletion using `deleted_at TIMESTAMPTZ` on `users`, `vulnerable_persons`, etc. The Java entities lack Hibernate 6 `@SQLRestriction("deleted_at IS NULL")`.
5. **JSONB Mapping**:
   `RiskScoringRuleEntity` and `WeatherObservationEntity` require Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)` for Jackson `JsonNode` mapping to PostgreSQL `JSONB` columns.

### Repositories (`com.extremeweather.repository.*`)
1. Every repository interface extends `JpaRepository<Entity, Long>` instead of `JpaRepository<Entity, UUID>`.
2. `UserRepository`:
   - Declares `Optional<User> findByUsername(String username);` and `boolean existsByUsername(String username);`.
   - In the database, `users` has no `username` column; uniqueness is enforced on `email` and `phone_number`.
   - Declares `List<User> findByRole(RoleEnum role);` which cannot query the table without a join on `user_roles`.
3. `RoleRepository`:
   - Declares `Optional<Role> findByName(String name);`.
   - The database column is `role_name`, and valid values are `CITIZEN`, `CAREGIVER`, `VOLUNTEER`, `AUTHORITY`, `ADMIN`.

---

## 5. Duplicate, Constraint, and Enum Conflicts

1. **Role Name Constraint Violation**:
   - Database check constraint: `chk_roles_name CHECK (role_name IN ('CITIZEN', 'CAREGIVER', 'VOLUNTEER', 'AUTHORITY', 'ADMIN'))`.
   - Backend `RoleEnum`: `ROLE_ADMIN`, `ROLE_AUTHORITY`, `ROLE_CAREGIVER`, `ROLE_CITIZEN`, `ROLE_VOLUNTEER`.
   - Inserting any value with prefix `ROLE_` violates the check constraint.
   - *Resolution*: Keep the DB check constraint intact. The Java entity should store the base role name (`ADMIN`), and the Spring Security `GrantedAuthority` mapping should prepend `"ROLE_"` in memory.
2. **Vulnerability Category Foreign Key vs Enum**:
   - In DB, `vulnerability_categories` is a master table with weights (`ELDERLY`, `CHILD`, `PERSON_WITH_DISABILITY`, `PREGNANT_WOMAN`, `MEDICAL_ASSISTANCE_REQUIRED`). `vulnerable_persons` has `primary_category_id UUID REFERENCES vulnerability_categories(category_id)`.
   - Backend entity treats it as a flat string enum column.
3. **Response Team Availability**:
   - In DB, `current_availability` is a string enum: `'AVAILABLE'`, `'DEPLOYED'`, `'STANDBY'`, `'OFF_DUTY'`.
   - In backend, `ResponseTeam` has `boolean isAvailable`.
4. **Emergency Priority & Case Status**:
   - `chk_case_priority`: `'LOW'`, `'MEDIUM'`, `'HIGH'`, `'CRITICAL'`.
   - `chk_case_status`: `'REPORTED'`, `'VERIFIED'`, `'ASSIGNED'`, `'IN_PROGRESS'`, `'RESOLVED'`, `'CLOSED'`.
   - Both sets match the Java enums `EmergencyPriority` and `CaseStatus`, but column names differ (`current_status` in DB vs `status` in Java).

---

## 6. How to Adopt the Populated Database Without Data Loss

The 20 users, 30 vulnerable persons, 5 regions, 10 cases, and 4 shelters are already safely stored in PostgreSQL `extreme_weather_db`. To adopt this database without losing any data:

1. **Never Drop or Recreate Tables**:
   The database schema is already complete, indexed, and constrained.
2. **Preserve `flyway_schema_history`**:
   The Flyway history table already has Version 1 recorded. Do not truncate or drop this table.
3. **Eliminate Conflicting Seed Invocations**:
   The database is already seeded. Running seed scripts (`V2` or `V5`) against it will cause primary key collisions or check constraint failures.
4. **Align Java Entities to the Real Schema**:
   Update JPA entities to map to the 39 existing tables and their exact columns (`UUID` keys, `role_name`, `user_id`, `person_id`, etc.), allowing Hibernate (`ddl-auto: validate`) to pass cleanly.

---

## 7. Recommended Flyway Baseline & Migration Sequence

### The Problem with Flyway State
Flyway currently contains:
- `installed_rank`: 1
- `version`: `'1'`
- `type`: `'BASELINE'`
- `success`: `true`

Because the backend classpath contained `V2__seed_demo_data.sql`, Flyway attempted to execute V2 and failed. If Flyway recorded a failed migration row for version `2` (`success: false`), subsequent migration attempts will immediately abort.

### The Correct Flyway Strategy
1. **Clear Failed Migration State**:
   Run `flyway.repair()` (or configure `spring.flyway.repair: true` on next startup). This removes any failed `V2` execution row from `flyway_schema_history` without deleting the baseline history or dropping any data.
2. **Option A (Recommended): Baseline Alignment to Handover Version 10**
   The 10 migrations from `database/migrations/` (`V1` to `V10`) represent the complete schema.
   - Replace the outdated migration files in `backend/src/main/resources/db/migration/` with the 10 official migration files from `database/migrations/` (`V1__create_user_management.sql` through `V10__create_indexes_and_constraints.sql`).
   - In `application.yml`, configure Flyway baseline:
     ```yaml
     spring:
       flyway:
         enabled: true
         baseline-on-migrate: true
         baseline-version: 10
         baseline-description: "Database Handover Baseline V10"
         validate-on-migrate: false
     ```
   - When Flyway starts:
     - With `baseline-version: 10`, Flyway treats the entire V1–V10 schema as already applied and will **never attempt to re-execute V1 through V10**.
     - Any future database modifications will be authored as `V11__<description>.sql`, cleanly continuing the migration lifecycle.
3. **Option B (Alternative): Re-version Backend Migrations Starting at V2**
   If maintaining `baseline-version: 1` is strictly required:
   - Remove the toy files `V2__seed_demo_data.sql` and `V3__integrate_handover_schema.sql`.
   - Any new migrations placed in `db/migration/` must start from `V2__...` and must be strictly **additive and idempotent** (using `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, and `INSERT ... ON CONFLICT DO NOTHING`).
   - However, since the database already contains all 38 tables and indexes, **no DDL or DML is required right now**. An empty or no-op migration sequence starting from `V11` (Option A) is significantly safer and avoids DDL conflicts.

---

## 8. Exact SQL Files Requiring Correction

| File Path | Nature of File | Why it Must Be Corrected / Retired |
|---|---|---|
| `backend/src/main/resources/db/migration/V1__init_schema.sql` | Backend Migration | Contradicts the real schema. Defines `BIGSERIAL` integer IDs, flat `users.role`, flat `vulnerable_persons.vulnerability_category`. Must be replaced with the official `database/migrations/V1__create_user_management.sql`. |
| `backend/src/main/resources/db/migration/V2__seed_demo_data.sql` | Backend Migration | **Direct cause of runtime crash**. References non-existent column `roles.name`, non-existent column `users.username`. Inserts `'ROLE_ADMIN'` which violates check constraint. Must be removed from the active migration sequence. |
| `backend/src/main/resources/db/migration/V3__integrate_handover_schema.sql` | Backend Migration | Flawed assumption that V1 created the schema. Attempts to alter tables that already have UUID primary keys and different column names. Must be retired. |
| `backend/src/main/resources/db/migration/V4__create_advanced_indexes_and_constraints.sql` | Backend Migration | Duplicate of `database/migrations/V10__create_indexes_and_constraints.sql`. Must be replaced by the official V10 migration. |
| `backend/src/main/resources/db/migration/V5__seed_handover_extended_data.sql` | Backend Migration | Tries to re-seed categories and shelters that already exist in `demo_data.sql`. Must be retired to avoid duplicate key conflicts. |

---

## 9. Safe Step-by-Step Repair Plan

> **Note**: In accordance with instructions, this audit is strictly READ-ONLY. No files have been modified yet. The following plan represents the exact, validated procedure for execution in the implementation phase:

### Step 1: Flyway Migration Directory Synchronization
1. Archive and remove the five broken backend migration files:
   - `backend/src/main/resources/db/migration/V1__init_schema.sql`
   - `backend/src/main/resources/db/migration/V2__seed_demo_data.sql`
   - `backend/src/main/resources/db/migration/V3__integrate_handover_schema.sql`
   - `backend/src/main/resources/db/migration/V4__create_advanced_indexes_and_constraints.sql`
   - `backend/src/main/resources/db/migration/V5__seed_handover_extended_data.sql`
2. Copy the 10 official migration files from `database/migrations/` into `backend/src/main/resources/db/migration/`:
   - `V1__create_user_management.sql`
   - `V2__create_vulnerability_management.sql`
   - `V3__create_geographical_management.sql`
   - `V4__create_weather_management.sql`
   - `V5__create_risk_assessment.sql`
   - `V6__create_emergency_management.sql`
   - `V7__create_response_team_management.sql`
   - `V8__create_notification_management.sql`
   - `V9__create_audit_and_security.sql`
   - `V10__create_indexes_and_constraints.sql`

### Step 2: Configure Flyway Baseline in `application.yml`
Update `backend/src/main/resources/application.yml`:
```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true
    baseline-version: 10
    baseline-description: "Database Handover Baseline V10"
    validate-on-migrate: false
    repair: true
```
*Effect*: Cleans any failed V2 record, establishes Version 10 as baseline, and skips running V1 through V10 against the already populated database.

### Step 3: Modernize JPA Entities to Match Handover Schema
Update the JPA entity classes in `com.extremeweather.entity`:
1. **`RoleEntity.java`**:
   - Change ID to `UUID roleId` with `@Column(name = "role_id")`.
   - Map `@Column(name = "role_name") private String roleName;`.
2. **`UserEntity.java`**:
   - Change ID to `UUID userId` with `@Column(name = "user_id")`.
   - Remove `username` and `role` columns.
   - Add `@ManyToMany @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id")) private Set<RoleEntity> roles;`.
   - Add `@SQLRestriction("deleted_at IS NULL")`.
3. **`VulnerablePersonEntity.java`**:
   - Change ID to `UUID personId` with `@Column(name = "person_id")`.
   - Add `@ManyToOne @JoinColumn(name = "primary_category_id") private VulnerabilityCategoryEntity primaryCategory;`.
   - Add `@Column(name = "district") private String district;`.
   - Add `@Column(name = "location", columnDefinition = "geometry(Point, 4326)") private Point location;`.
   - Add `@SQLRestriction("deleted_at IS NULL AND is_active = TRUE")`.
4. **`GeographicalRegionEntity.java`**:
   - Change ID to `UUID regionId` with `@Column(name = "region_id")`.
   - Map `region_name`, `region_code`, `boundary` (`MultiPolygon`), and `centroid` (`Point`).
5. **`EmergencyCaseEntity.java`**:
   - Change ID to `UUID caseId` with `@Column(name = "case_id")`.
   - Map `@ManyToOne @JoinColumn(name = "reporter_id") private UserEntity reporter;`.
   - Map `@ManyToOne @JoinColumn(name = "category_id") private EmergencyCategoryEntity category;`.
   - Map `@Column(name = "current_status") private String currentStatus;`.
   - Map `@Column(name = "location") private Point location;`.
6. Add helper entities for handover tables:
   - `VulnerabilityCategoryEntity`, `AssistanceRequirementEntity`, `EmergencyCategoryEntity`, `WeatherEventTypeEntity`.

### Step 4: Update Repository and Security Services
1. Update all repositories from `JpaRepository<Entity, Long>` to `JpaRepository<Entity, UUID>`.
2. Update `UserRepository`:
   - Replace `findByUsername` with `Optional<UserEntity> findByEmail(String email);` and `Optional<UserEntity> findByPhoneNumber(String phoneNumber);`.
3. Update `CustomUserDetailsService`:
   - Authenticate by `email` or `phone_number`.
   - In `UserPrincipal`, map each role to Spring Security authority as `"ROLE_" + role.getRoleName()` (e.g. role `ADMIN` maps to authority `ROLE_ADMIN`).
4. Update `VulnerablePersonRepository` and `EmergencyCaseRepository` to query using PostGIS spatial functions (`ST_DWithin`, `ST_Within`).

### Step 5: Verification & Zero-Data-Loss Gate
1. Start backend with `spring.jpa.hibernate.ddl-auto: validate`.
   - Verifies that all entity mappings strictly agree with the existing 39 PostgreSQL tables.
2. Query existing data:
   - Verify `userRepository.count() == 20`.
   - Verify `vulnerablePersonRepository.count() == 30`.
   - Verify `roleRepository.count() == 5`.
3. Test login with an existing demo account:
   - Email: `ramesh.kumar@demo-karnataka.gov.in`
   - Password: `DemonstrationPass@2026!`
   - Verify JWT issued with role `ROLE_AUTHORITY`.
4. Confirm PostGIS spatial query returns vulnerable persons inside Kodagu / Kalaburagi regions.

---
**Audit Complete**: All 8 tasks audited in read-only mode. Complete report saved to `MIGRATION_COMPATIBILITY_AUDIT.md`.
