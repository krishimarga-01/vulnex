-- ============================================================================
-- MASTER DATABASE INITIALIZATION SCRIPT (CONSOLIDATED)
-- System: Extreme Weather Vulnerability Identification & Emergency Response
-- Target Database: PostgreSQL 16+ with PostGIS Extension
-- Note: This script concatenates migrations V1 through V10 for single-run execution.
-- ============================================================================

BEGIN;

-- >>> BEGIN V1__create_user_management.sql <<<
-- ============================================================================
-- Migration: V1__create_user_management.sql
-- Description: Core extensions, user authentication, RBAC, sessions, and contacts
-- Author: Senior Database Architect
-- ============================================================================

-- Ensure required PostgreSQL extensions are active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ----------------------------------------------------------------------------
-- Shared Utility Function: Automatic updated_at timestamp maintenance
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. Table: roles
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_roles_role_name UNIQUE (role_name),
    CONSTRAINT chk_roles_name CHECK (role_name IN ('CITIZEN', 'CAREGIVER', 'VOLUNTEER', 'AUTHORITY', 'ADMIN'))
);

COMMENT ON TABLE roles IS 'System RBAC roles defining access permissions across mobile and authority dashboard';
COMMENT ON COLUMN roles.role_name IS 'Standardized system role identifier';

-- ----------------------------------------------------------------------------
-- 2. Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_phone_number UNIQUE (phone_number),
    CONSTRAINT chk_users_account_status CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DEACTIVATED')),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Master user accounts for citizens, caregivers, emergency responders, and authorities';
COMMENT ON COLUMN users.password_hash IS 'BCrypt/Argon2 one-way cryptographically salted password hash';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp preserving data history in audits and emergency cases';

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. Table: user_roles (Junction table)
-- ----------------------------------------------------------------------------
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

COMMENT ON TABLE user_roles IS 'Many-to-many relationship mapping users to system roles';

-- ----------------------------------------------------------------------------
-- 4. Table: user_sessions
-- ----------------------------------------------------------------------------
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE user_sessions IS 'Active JWT/OAuth refresh sessions for mobile and web clients';

-- ----------------------------------------------------------------------------
-- 5. Table: emergency_contacts
-- ----------------------------------------------------------------------------
CREATE TABLE emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    priority_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emergency_contacts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_contact_priority CHECK (priority_order > 0)
);

COMMENT ON TABLE emergency_contacts IS 'Personal emergency contacts designated by registered users';

CREATE TRIGGER trg_emergency_contacts_updated_at
BEFORE UPDATE ON emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- >>> END V1__create_user_management.sql <<<

-- >>> BEGIN V10__create_indexes_and_constraints.sql <<<
-- ============================================================================
-- Migration: V10__create_indexes_and_constraints.sql
-- Description: B-Tree, PostGIS GiST spatial indexes, and composite dashboard indexes
-- Author: Senior Database Architect
-- ============================================================================

-- ============================================================================
-- SECTION 1: SPATIAL GIST INDEXES (PostGIS Geometry)
-- ============================================================================
CREATE INDEX idx_vulnerable_persons_location ON vulnerable_persons USING GIST (location);
CREATE INDEX idx_geographical_regions_boundary ON geographical_regions USING GIST (boundary);
CREATE INDEX idx_geographical_regions_centroid ON geographical_regions USING GIST (centroid);
CREATE INDEX idx_affected_zones_boundary ON affected_zones USING GIST (boundary);
CREATE INDEX idx_shelters_location ON shelters USING GIST (location);
CREATE INDEX idx_emergency_cases_location ON emergency_cases USING GIST (location);
CREATE INDEX idx_response_team_locations_location ON response_team_locations USING GIST (location);

-- ============================================================================
-- SECTION 2: FOREIGN KEY INDEXES (Optimizing Joins & Cascade Checks)
-- ============================================================================
-- User Management
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts (user_id);

-- Vulnerable Population
CREATE INDEX idx_vulnerable_persons_reg_user ON vulnerable_persons (registered_by_user_id);
CREATE INDEX idx_vulnerable_persons_primary_cat ON vulnerable_persons (primary_category_id);
CREATE INDEX idx_vulnerable_persons_region_id ON vulnerable_persons (geographical_region_id);
CREATE INDEX idx_vulnerable_persons_verifier ON vulnerable_persons (verified_by_user_id);
CREATE INDEX idx_caregiver_rel_caregiver ON caregiver_relationships (caregiver_user_id);
CREATE INDEX idx_caregiver_rel_person ON caregiver_relationships (person_id);
CREATE INDEX idx_person_assist_person ON person_assistance_requirements (person_id);
CREATE INDEX idx_person_assist_req ON person_assistance_requirements (requirement_id);
CREATE INDEX idx_person_contacts_person ON person_emergency_contacts (person_id);

-- Geographical & Shelters
CREATE INDEX idx_affected_zones_creator ON affected_zones (created_by_user_id);
CREATE INDEX idx_shelter_capacity_shelter ON shelter_capacity (shelter_id);
CREATE INDEX idx_shelter_capacity_updater ON shelter_capacity (updated_by_user_id);

-- Weather Monitoring
CREATE INDEX idx_weather_obs_region_id ON weather_observations (region_id);
CREATE INDEX idx_weather_alerts_event_type ON weather_alerts (event_type_id);
CREATE INDEX idx_weather_alerts_creator ON weather_alerts (created_by_user_id);
CREATE INDEX idx_weather_alert_regions_alert ON weather_alert_regions (alert_id);
CREATE INDEX idx_weather_alert_regions_region ON weather_alert_regions (region_id);

-- Risk Assessment
CREATE INDEX idx_risk_assessments_person ON risk_assessments (person_id);
CREATE INDEX idx_risk_assessments_alert ON risk_assessments (weather_alert_id);
CREATE INDEX idx_risk_assessments_rule ON risk_assessments (rule_id);
CREATE INDEX idx_risk_factors_assessment ON risk_assessment_factors (assessment_id);

-- Emergency Management
CREATE INDEX idx_emergency_cases_reporter ON emergency_cases (reporter_id);
CREATE INDEX idx_emergency_cases_affected_person ON emergency_cases (affected_person_id);
CREATE INDEX idx_emergency_cases_category ON emergency_cases (category_id);
CREATE INDEX idx_emergency_cases_alert ON emergency_cases (weather_alert_id);
CREATE INDEX idx_emergency_cases_team ON emergency_cases (assigned_team_id);
CREATE INDEX idx_emergency_case_updates_case ON emergency_case_updates (case_id);
CREATE INDEX idx_emergency_case_updates_user ON emergency_case_updates (updated_by_user_id);
CREATE INDEX idx_case_assignments_case ON case_assignments (case_id);
CREATE INDEX idx_case_assignments_team ON case_assignments (team_id);
CREATE INDEX idx_case_attachments_case ON case_attachments (case_id);

-- Response Teams
CREATE INDEX idx_response_teams_region ON response_teams (base_region_id);
CREATE INDEX idx_response_team_members_team ON response_team_members (team_id);
CREATE INDEX idx_response_team_members_user ON response_team_members (user_id);
CREATE INDEX idx_response_team_locations_team ON response_team_locations (team_id);
CREATE INDEX idx_team_availability_team ON team_availability (team_id);

-- Notifications
CREATE INDEX idx_device_tokens_user ON device_tokens (user_id);
CREATE INDEX idx_notifications_alert ON notifications (related_weather_alert_id);
CREATE INDEX idx_notifications_case ON notifications (related_case_id);
CREATE INDEX idx_notification_recipients_notif ON notification_recipients (notification_id);
CREATE INDEX idx_notification_recipients_user ON notification_recipients (user_id);
CREATE INDEX idx_notification_logs_recipient ON notification_delivery_logs (recipient_id);

-- Audit & Security
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_consent_records_person ON consent_records (person_id);
CREATE INDEX idx_consent_records_user ON consent_records (consenting_user_id);
CREATE INDEX idx_access_logs_user ON access_logs (user_id);
CREATE INDEX idx_access_logs_person ON access_logs (accessed_person_id);

-- ============================================================================
-- SECTION 3: LOOKUP & SEARCH INDEXES (Equality, Sorting, and Time-Series)
-- ============================================================================
CREATE INDEX idx_users_account_status ON users (account_status);
CREATE INDEX idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_vulnerable_persons_status ON vulnerable_persons (verification_status, is_active);
CREATE INDEX idx_vulnerable_persons_age_cat ON vulnerable_persons (age_category);
CREATE INDEX idx_geographical_regions_district ON geographical_regions (district);
CREATE INDEX idx_shelters_district_status ON shelters (district, status);
CREATE INDEX idx_weather_obs_timestamp ON weather_observations (observation_timestamp DESC);
CREATE INDEX idx_weather_alerts_status ON weather_alerts (alert_status);
CREATE INDEX idx_weather_alerts_severity ON weather_alerts (severity);
CREATE INDEX idx_emergency_cases_status ON emergency_cases (current_status);
CREATE INDEX idx_emergency_cases_priority ON emergency_cases (priority);
CREATE INDEX idx_emergency_cases_reported_at ON emergency_cases (reported_at DESC);
CREATE INDEX idx_response_teams_availability ON response_teams (current_availability, team_type);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX idx_access_logs_timestamp ON access_logs (access_timestamp DESC);

-- ============================================================================
-- SECTION 4: HIGH-PERFORMANCE COMPOSITE DASHBOARD INDEXES
-- ============================================================================
-- Optimizes real-time authority emergency triage grid
CREATE INDEX idx_emergency_cases_dashboard_triage
ON emergency_cases (current_status, priority, reported_at DESC);

-- Optimizes regional risk assessment heatmaps and counts
CREATE INDEX idx_risk_assessments_dashboard_stats
ON risk_assessments (risk_classification, assessed_at DESC);

-- Optimizes active weather alerts window queries
CREATE INDEX idx_weather_alerts_active_window
ON weather_alerts (alert_status, start_time, expiration_time);

-- Optimizes notification dispatch delivery rate analytics
CREATE INDEX idx_notif_recipients_delivery_analytics
ON notification_recipients (delivery_status, target_channel, sent_at DESC);

-- Optimizes regional vulnerable population aggregations
CREATE INDEX idx_vuln_persons_region_active
ON vulnerable_persons (geographical_region_id, primary_category_id)
WHERE is_active = TRUE AND deleted_at IS NULL;

-- Optimizes time-series weather telemetry per region
CREATE INDEX idx_weather_obs_region_timeline
ON weather_observations (region_id, observation_timestamp DESC);

-- >>> END V10__create_indexes_and_constraints.sql <<<

-- >>> BEGIN V2__create_vulnerability_management.sql <<<
-- ============================================================================
-- Migration: V2__create_vulnerability_management.sql
-- Description: Vulnerable individuals, categories, assistance needs, and caregiver links
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: vulnerability_categories
-- ----------------------------------------------------------------------------
CREATE TABLE vulnerability_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_vulnerability_weight NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_vuln_category_code UNIQUE (category_code),
    CONSTRAINT chk_vuln_category_code CHECK (
        category_code IN (
            'ELDERLY',
            'CHILD',
            'PERSON_WITH_DISABILITY',
            'PREGNANT_WOMAN',
            'MEDICAL_ASSISTANCE_REQUIRED'
        )
    ),
    CONSTRAINT chk_vuln_base_weight CHECK (base_vulnerability_weight > 0)
);

COMMENT ON TABLE vulnerability_categories IS 'Master catalog of vulnerability classifications with risk baseline weights';

-- ----------------------------------------------------------------------------
-- 2. Table: assistance_requirements
-- ----------------------------------------------------------------------------
CREATE TABLE assistance_requirements (
    requirement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_code VARCHAR(50) NOT NULL,
    requirement_name VARCHAR(100) NOT NULL,
    priority_level VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_assistance_req_code UNIQUE (requirement_code),
    CONSTRAINT chk_assistance_priority CHECK (priority_level IN ('STANDARD', 'URGENT', 'CRITICAL'))
);

COMMENT ON TABLE assistance_requirements IS 'Catalog of physical, medical, and logistical assistance specifications';

-- ----------------------------------------------------------------------------
-- 3. Table: vulnerable_persons
-- ----------------------------------------------------------------------------
CREATE TABLE vulnerable_persons (
    person_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registered_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE,
    age INT,
    age_category VARCHAR(30) NOT NULL,
    gender VARCHAR(20),
    primary_phone VARCHAR(20),
    address_line TEXT,
    village_or_locality VARCHAR(100),
    taluk VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    postal_code VARCHAR(15),
    primary_category_id UUID NOT NULL REFERENCES vulnerability_categories(category_id) ON DELETE RESTRICT,
    geographical_region_id UUID, -- Foreign key constraint linked in V3
    location GEOMETRY(Point, 4326),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
    verified_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    consent_status VARCHAR(30) NOT NULL DEFAULT 'GIVEN',
    consent_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    medical_notes_encrypted TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vuln_age CHECK (age IS NULL OR (age >= 0 AND age <= 130)),
    CONSTRAINT chk_vuln_age_cat CHECK (age_category IN ('INFANT', 'CHILD', 'ADULT', 'SENIOR_CITIZEN')),
    CONSTRAINT chk_vuln_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED')),
    CONSTRAINT chk_vuln_verification CHECK (verification_status IN ('UNVERIFIED', 'VERIFIED', 'REJECTED')),
    CONSTRAINT chk_vuln_consent CHECK (consent_status IN ('GIVEN', 'WITHDRAWN', 'PENDING')),
    CONSTRAINT chk_lat_coord CHECK (latitude IS NULL OR (latitude BETWEEN -90.0 AND 90.0)),
    CONSTRAINT chk_lon_coord CHECK (longitude IS NULL OR (longitude BETWEEN -180.0 AND 180.0))
);

COMMENT ON TABLE vulnerable_persons IS 'Core registry of vulnerable individuals requiring priority disaster response';
COMMENT ON COLUMN vulnerable_persons.medical_notes_encrypted IS 'Encrypted medical triage notes for field responders';
COMMENT ON COLUMN vulnerable_persons.location IS 'PostGIS 2D Point WGS 84 (Lon, Lat)';

CREATE TRIGGER trg_vulnerable_persons_updated_at
BEFORE UPDATE ON vulnerable_persons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Table: caregiver_relationships
-- ----------------------------------------------------------------------------
CREATE TABLE caregiver_relationships (
    relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES vulnerable_persons(person_id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    emergency_authorization BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_caregiver_person UNIQUE (caregiver_user_id, person_id),
    CONSTRAINT chk_caregiver_type CHECK (
        relationship_type IN (
            'PARENT',
            'GUARDIAN',
            'SPOUSE',
            'CHILD',
            'PROFESSIONAL_CAREGIVER',
            'SIBLING',
            'VOLUNTEER_GUARDIAN'
        )
    )
);

COMMENT ON TABLE caregiver_relationships IS 'Mapping connecting designated caregivers and guardians to vulnerable individuals';

-- ----------------------------------------------------------------------------
-- 5. Table: person_assistance_requirements (Junction table)
-- ----------------------------------------------------------------------------
CREATE TABLE person_assistance_requirements (
    person_id UUID NOT NULL REFERENCES vulnerable_persons(person_id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES assistance_requirements(requirement_id) ON DELETE RESTRICT,
    notes TEXT,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (person_id, requirement_id)
);

COMMENT ON TABLE person_assistance_requirements IS 'Specific assistance and equipment needs assigned to a vulnerable person';

-- ----------------------------------------------------------------------------
-- 6. Table: person_emergency_contacts
-- ----------------------------------------------------------------------------
CREATE TABLE person_emergency_contacts (
    person_contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES vulnerable_persons(person_id) ON DELETE CASCADE,
    contact_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    priority_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_person_contact_priority CHECK (priority_order > 0)
);

COMMENT ON TABLE person_emergency_contacts IS 'Specific emergency points of contact directly tied to vulnerable individuals';

-- >>> END V2__create_vulnerability_management.sql <<<

-- >>> BEGIN V3__create_geographical_management.sql <<<
-- ============================================================================
-- Migration: V3__create_geographical_management.sql
-- Description: PostGIS administrative regions, hazard zones, shelters, and capacities
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: geographical_regions
-- ----------------------------------------------------------------------------
CREATE TABLE geographical_regions (
    region_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code VARCHAR(50) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    district VARCHAR(100) NOT NULL,
    taluk VARCHAR(100),
    village_or_locality VARCHAR(100),
    boundary GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    region_risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    elevation_meters NUMERIC(8, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_regions_code UNIQUE (region_code),
    CONSTRAINT chk_regions_risk_level CHECK (region_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'SEVERE')),
    CONSTRAINT chk_region_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_region_lon CHECK (longitude BETWEEN -180.0 AND 180.0)
);

COMMENT ON TABLE geographical_regions IS 'Administrative and geographic boundaries for regional vulnerability tracking';
COMMENT ON COLUMN geographical_regions.boundary IS 'PostGIS MultiPolygon representing administrative jurisdiction boundary (WGS 84)';

CREATE TRIGGER trg_geographical_regions_updated_at
BEFORE UPDATE ON geographical_regions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Link Foreign Key: vulnerable_persons -> geographical_regions
-- ----------------------------------------------------------------------------
ALTER TABLE vulnerable_persons
ADD CONSTRAINT fk_vulnerable_persons_region
FOREIGN KEY (geographical_region_id) REFERENCES geographical_regions(region_id)
ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 2. Table: affected_zones
-- ----------------------------------------------------------------------------
CREATE TABLE affected_zones (
    zone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name VARCHAR(150) NOT NULL,
    hazard_type VARCHAR(50) NOT NULL,
    severity_level VARCHAR(20) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_zone_hazard_type CHECK (
        hazard_type IN (
            'FLOOD_INUNDATION',
            'CYCLONE_PATH',
            'HEATWAVE_CORRIDOR',
            'LANDSLIDE_PRONE'
        )
    ),
    CONSTRAINT chk_zone_severity CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_zone_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

COMMENT ON TABLE affected_zones IS 'Dynamic geospatial danger zones representing actual extreme weather footprint';
COMMENT ON COLUMN affected_zones.boundary IS 'PostGIS Polygon representing real-time hazard perimeter';

-- ----------------------------------------------------------------------------
-- 3. Table: shelters
-- ----------------------------------------------------------------------------
CREATE TABLE shelters (
    shelter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shelter_code VARCHAR(50) NOT NULL,
    shelter_name VARCHAR(150) NOT NULL,
    shelter_type VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluk VARCHAR(100),
    address TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    contact_person_name VARCHAR(150),
    contact_phone VARCHAR(20),
    is_accessible_disabled BOOLEAN NOT NULL DEFAULT TRUE,
    has_medical_facility BOOLEAN NOT NULL DEFAULT FALSE,
    has_backup_power BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shelters_code UNIQUE (shelter_code),
    CONSTRAINT chk_shelter_type CHECK (
        shelter_type IN (
            'SCHOOL',
            'COMMUNITY_HALL',
            'STADIUM',
            'HOSPITAL',
            'TEMPORARY_CAMP'
        )
    ),
    CONSTRAINT chk_shelter_status CHECK (status IN ('ACTIVE', 'FULL', 'CLOSED', 'MAINTENANCE')),
    CONSTRAINT chk_shelter_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_shelter_lon CHECK (longitude BETWEEN -180.0 AND 180.0)
);

COMMENT ON TABLE shelters IS 'Official emergency relief shelters and temporary evacuation centers';
COMMENT ON COLUMN shelters.location IS 'PostGIS Point location for shelter proximity calculation';

CREATE TRIGGER trg_shelters_updated_at
BEFORE UPDATE ON shelters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Table: shelter_capacity
-- ----------------------------------------------------------------------------
CREATE TABLE shelter_capacity (
    capacity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shelter_id UUID NOT NULL,
    total_capacity INT NOT NULL,
    current_occupancy INT NOT NULL DEFAULT 0,
    available_capacity INT GENERATED ALWAYS AS (total_capacity - current_occupancy) STORED,
    special_care_capacity INT NOT NULL DEFAULT 0,
    special_care_occupancy INT NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT uq_shelter_capacity_shelter UNIQUE (shelter_id),
    CONSTRAINT fk_shelter_capacity_shelter FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id) ON DELETE CASCADE,
    CONSTRAINT chk_capacity_positive CHECK (total_capacity >= 0),
    CONSTRAINT chk_occupancy_valid CHECK (current_occupancy >= 0 AND current_occupancy <= total_capacity),
    CONSTRAINT chk_special_care_valid CHECK (special_care_occupancy >= 0 AND special_care_occupancy <= special_care_capacity)
);

COMMENT ON TABLE shelter_capacity IS 'Real-time and managed capacity tracking for emergency shelters';

-- >>> END V3__create_geographical_management.sql <<<

-- >>> BEGIN V4__create_weather_management.sql <<<
-- ============================================================================
-- Migration: V4__create_weather_management.sql
-- Description: Weather observations, meteorological event types, and multi-region alerts
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: weather_event_types
-- ----------------------------------------------------------------------------
CREATE TABLE weather_event_types (
    event_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_code VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    severity_scale_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_weather_event_code UNIQUE (event_code),
    CONSTRAINT chk_weather_event_code CHECK (
        event_code IN (
            'EXTREME_HEAT',
            'HEAVY_RAINFALL',
            'FLOOD',
            'CYCLONE',
            'SEVERE_STORM'
        )
    )
);

COMMENT ON TABLE weather_event_types IS 'Master classifications of extreme meteorological threats';

-- ----------------------------------------------------------------------------
-- 2. Table: weather_observations
-- ----------------------------------------------------------------------------
CREATE TABLE weather_observations (
    observation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES geographical_regions(region_id) ON DELETE CASCADE,
    weather_provider VARCHAR(100) NOT NULL,
    source_station_id VARCHAR(100),
    temperature_celsius NUMERIC(5, 2),
    relative_humidity_percent NUMERIC(5, 2),
    rainfall_mm NUMERIC(7, 2),
    wind_speed_kmh NUMERIC(6, 2),
    wind_gust_kmh NUMERIC(6, 2),
    atmospheric_pressure_hpa NUMERIC(7, 2),
    heat_index_celsius NUMERIC(5, 2),
    raw_payload JSONB,
    observation_timestamp TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_obs_humidity CHECK (relative_humidity_percent IS NULL OR (relative_humidity_percent BETWEEN 0.0 AND 100.0)),
    CONSTRAINT chk_obs_rainfall CHECK (rainfall_mm IS NULL OR rainfall_mm >= 0.0),
    CONSTRAINT chk_obs_wind CHECK (wind_speed_kmh IS NULL OR wind_speed_kmh >= 0.0)
);

COMMENT ON TABLE weather_observations IS 'Telemetry sensor data and periodic weather observations from providers like IMD';
COMMENT ON COLUMN weather_observations.raw_payload IS 'Selective JSONB storing unparsed sensor telemetry';

-- ----------------------------------------------------------------------------
-- 3. Table: weather_alerts
-- ----------------------------------------------------------------------------
CREATE TABLE weather_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_source_id VARCHAR(100),
    event_type_id UUID NOT NULL REFERENCES weather_event_types(event_type_id) ON DELETE RESTRICT,
    alert_title VARCHAR(200) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    instruction TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    expiration_time TIMESTAMPTZ NOT NULL,
    alert_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_alert_severity CHECK (severity IN ('WARNING', 'WATCH', 'ADVISORY', 'EMERGENCY')),
    CONSTRAINT chk_alert_status CHECK (alert_status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUPERSEDED')),
    CONSTRAINT chk_alert_duration CHECK (expiration_time > start_time)
);

COMMENT ON TABLE weather_alerts IS 'Official meteorological warnings and alerts issued by meteorological departments';

CREATE TRIGGER trg_weather_alerts_updated_at
BEFORE UPDATE ON weather_alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Table: weather_alert_regions (Junction table)
-- ----------------------------------------------------------------------------
CREATE TABLE weather_alert_regions (
    alert_id UUID NOT NULL REFERENCES weather_alerts(alert_id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES geographical_regions(region_id) ON DELETE CASCADE,
    affected_severity VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (alert_id, region_id),
    CONSTRAINT chk_alert_region_sev CHECK (affected_severity IS NULL OR affected_severity IN ('YELLOW', 'ORANGE', 'RED', 'STANDARD'))
);

COMMENT ON TABLE weather_alert_regions IS 'Mapping associating one weather alert with multiple vulnerable geographical regions';

-- >>> END V4__create_weather_management.sql <<<

-- >>> BEGIN V5__create_risk_assessment.sql <<<
-- ============================================================================
-- Migration: V5__create_risk_assessment.sql
-- Description: Risk scoring rules, assessment results, and factor breakdown
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: risk_scoring_rules
-- ----------------------------------------------------------------------------
CREATE TABLE risk_scoring_rules (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_version VARCHAR(30) NOT NULL,
    rule_name VARCHAR(150) NOT NULL,
    parameters JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_risk_rule_version UNIQUE (rule_version)
);

COMMENT ON TABLE risk_scoring_rules IS 'Versioned rule configurations and algorithmic weights used by the Java Spring Boot service';
COMMENT ON COLUMN risk_scoring_rules.parameters IS 'JSONB configuration specifying factor multipliers, threshold curves, and category coefficients';

-- ----------------------------------------------------------------------------
-- 2. Table: risk_assessments
-- ----------------------------------------------------------------------------
CREATE TABLE risk_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES vulnerable_persons(person_id) ON DELETE CASCADE,
    weather_alert_id UUID REFERENCES weather_alerts(alert_id) ON DELETE SET NULL,
    rule_id UUID NOT NULL REFERENCES risk_scoring_rules(rule_id) ON DELETE RESTRICT,
    risk_score NUMERIC(5, 2) NOT NULL,
    risk_classification VARCHAR(20) NOT NULL,
    assessment_explanation TEXT NOT NULL,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_assessment_score CHECK (risk_score >= 0.00 AND risk_score <= 100.00),
    CONSTRAINT chk_assessment_classification CHECK (risk_classification IN ('LOW', 'MEDIUM', 'HIGH'))
);

COMMENT ON TABLE risk_assessments IS 'Computed risk levels for vulnerable individuals evaluated against weather hazards';
COMMENT ON COLUMN risk_assessments.risk_classification IS 'Categorical risk triage level: LOW, MEDIUM, HIGH';

-- ----------------------------------------------------------------------------
-- 3. Table: risk_assessment_factors
-- ----------------------------------------------------------------------------
CREATE TABLE risk_assessment_factors (
    factor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES risk_assessments(assessment_id) ON DELETE CASCADE,
    factor_name VARCHAR(100) NOT NULL,
    factor_weight NUMERIC(5, 2) NOT NULL,
    factor_score NUMERIC(5, 2) NOT NULL,
    factor_detail JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_factor_weight CHECK (factor_weight >= 0.0),
    CONSTRAINT chk_factor_score CHECK (factor_score >= 0.0)
);

COMMENT ON TABLE risk_assessment_factors IS 'Granular factor contributions explaining how an individual risk score was derived';
COMMENT ON COLUMN risk_assessment_factors.factor_detail IS 'JSONB metadata containing raw sub-scores and sensor values for full auditability';

-- >>> END V5__create_risk_assessment.sql <<<

-- >>> BEGIN V6__create_emergency_management.sql <<<
-- ============================================================================
-- Migration: V6__create_emergency_management.sql
-- Description: Emergency case management, triage, case history, and attachments
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: emergency_categories
-- ----------------------------------------------------------------------------
CREATE TABLE emergency_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    priority_weight INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emergency_cat_code UNIQUE (category_code),
    CONSTRAINT chk_emergency_cat_code CHECK (
        category_code IN (
            'MEDICAL_ASSISTANCE',
            'EVACUATION',
            'RESCUE',
            'FOOD_AND_WATER',
            'TRANSPORTATION',
            'OTHER'
        )
    ),
    CONSTRAINT chk_emergency_priority_wt CHECK (priority_weight >= 1)
);

COMMENT ON TABLE emergency_categories IS 'Classifications of emergency assistance requests';

-- ----------------------------------------------------------------------------
-- 2. Table: emergency_cases
-- ----------------------------------------------------------------------------
CREATE TABLE emergency_cases (
    case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(30) NOT NULL,
    reporter_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    affected_person_id UUID NOT NULL REFERENCES vulnerable_persons(person_id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES emergency_categories(category_id) ON DELETE RESTRICT,
    weather_alert_id UUID REFERENCES weather_alerts(alert_id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    address_details TEXT,
    priority VARCHAR(20) NOT NULL,
    current_status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
    assigned_team_id UUID, -- Foreign key constraint linked in V7
    resolution_details TEXT,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emergency_cases_number UNIQUE (case_number),
    CONSTRAINT chk_case_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_case_status CHECK (
        current_status IN (
            'REPORTED',
            'VERIFIED',
            'ASSIGNED',
            'IN_PROGRESS',
            'RESOLVED',
            'CLOSED'
        )
    ),
    CONSTRAINT chk_case_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_case_lon CHECK (longitude BETWEEN -180.0 AND 180.0)
);

COMMENT ON TABLE emergency_cases IS 'Primary incident tickets for extreme weather distress calls and dispatch';
COMMENT ON COLUMN emergency_cases.reporter_id IS 'RESTRICT constraint prevents accidental loss of case history if user is deleted';

CREATE TRIGGER trg_emergency_cases_updated_at
BEFORE UPDATE ON emergency_cases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. Table: emergency_case_updates (Complete status timeline)
-- ----------------------------------------------------------------------------
CREATE TABLE emergency_case_updates (
    update_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES emergency_cases(case_id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    notes TEXT NOT NULL,
    updated_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_update_status CHECK (
        new_status IN (
            'REPORTED',
            'VERIFIED',
            'ASSIGNED',
            'IN_PROGRESS',
            'RESOLVED',
            'CLOSED'
        )
    )
);

COMMENT ON TABLE emergency_case_updates IS 'Immutable timeline tracking all lifecycle status changes and field notes';

-- ----------------------------------------------------------------------------
-- 4. Table: case_assignments
-- ----------------------------------------------------------------------------
CREATE TABLE case_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES emergency_cases(case_id) ON DELETE CASCADE,
    team_id UUID NOT NULL, -- Foreign key constraint linked in V7
    assigned_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    assignment_notes TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    assignment_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT chk_assignment_status CHECK (
        assignment_status IN (
            'ACTIVE',
            'COMPLETED',
            'REASSIGNED',
            'CANCELLED'
        )
    )
);

COMMENT ON TABLE case_assignments IS 'Historical dispatch assignments connecting emergency cases to response teams';

-- ----------------------------------------------------------------------------
-- 5. Table: case_attachments
-- ----------------------------------------------------------------------------
CREATE TABLE case_attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES emergency_cases(case_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_attachment_size CHECK (file_size_bytes > 0)
);

COMMENT ON TABLE case_attachments IS 'Damage photos, medical certificates, and dispatch documentation';

-- >>> END V6__create_emergency_management.sql <<<

-- >>> BEGIN V7__create_response_team_management.sql <<<
-- ============================================================================
-- Migration: V7__create_response_team_management.sql
-- Description: Rescue teams, crew rosters, live GPS telemetry, and availability
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: response_teams
-- ----------------------------------------------------------------------------
CREATE TABLE response_teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_code VARCHAR(50) NOT NULL,
    team_name VARCHAR(150) NOT NULL,
    team_type VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255),
    base_region_id UUID REFERENCES geographical_regions(region_id) ON DELETE SET NULL,
    current_availability VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_response_team_code UNIQUE (team_code),
    CONSTRAINT chk_team_type CHECK (
        team_type IN (
            'NDRF',
            'SDRF',
            'MEDICAL_CORPS',
            'FIRE_RESCUE',
            'VOLUNTEER_CORPS',
            'CIVIL_DEFENSE'
        )
    ),
    CONSTRAINT chk_team_availability CHECK (
        current_availability IN (
            'AVAILABLE',
            'DEPLOYED',
            'STANDBY',
            'OFF_DUTY'
        )
    )
);

COMMENT ON TABLE response_teams IS 'Emergency operational response units including NDRF, SDRF, and medical teams';

CREATE TRIGGER trg_response_teams_updated_at
BEFORE UPDATE ON response_teams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Link Foreign Keys from V6 to response_teams
-- ----------------------------------------------------------------------------
ALTER TABLE emergency_cases
ADD CONSTRAINT fk_emergency_cases_assigned_team
FOREIGN KEY (assigned_team_id) REFERENCES response_teams(team_id)
ON DELETE SET NULL;

ALTER TABLE case_assignments
ADD CONSTRAINT fk_case_assignments_team
FOREIGN KEY (team_id) REFERENCES response_teams(team_id)
ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- 2. Table: response_team_members
-- ----------------------------------------------------------------------------
CREATE TABLE response_team_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES response_teams(team_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    member_role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_team_user UNIQUE (team_id, user_id),
    CONSTRAINT chk_member_role CHECK (
        member_role IN (
            'TEAM_LEADER',
            'PARAMEDIC',
            'RESCUE_SPECIALIST',
            'DRIVER',
            'DISPATCHER'
        )
    )
);

COMMENT ON TABLE response_team_members IS 'Individual responders deployed within specific emergency response teams';

-- ----------------------------------------------------------------------------
-- 3. Table: response_team_locations (Live telemetry)
-- ----------------------------------------------------------------------------
CREATE TABLE response_team_locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES response_teams(team_id) ON DELETE CASCADE,
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    speed_kmh NUMERIC(5, 2),
    battery_level_percent INT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_team_loc_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_team_loc_lon CHECK (longitude BETWEEN -180.0 AND 180.0),
    CONSTRAINT chk_battery_pct CHECK (battery_level_percent IS NULL OR (battery_level_percent BETWEEN 0 AND 100))
);

COMMENT ON TABLE response_team_locations IS 'High-frequency GPS telemetry trail for live field response tracking';

-- ----------------------------------------------------------------------------
-- 4. Table: team_availability
-- ----------------------------------------------------------------------------
CREATE TABLE team_availability (
    availability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES response_teams(team_id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    reason_or_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_avail_status CHECK (
        status IN (
            'AVAILABLE',
            'DEPLOYED',
            'ON_BREAK',
            'OFF_DUTY'
        )
    ),
    CONSTRAINT chk_avail_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

COMMENT ON TABLE team_availability IS 'Historical and scheduled availability shifts for emergency dispatch planning';

-- >>> END V7__create_response_team_management.sql <<<

-- >>> BEGIN V8__create_notification_management.sql <<<
-- ============================================================================
-- Migration: V8__create_notification_management.sql
-- Description: Multi-channel notifications, device tokens, recipients, and delivery logs
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: device_tokens
-- ----------------------------------------------------------------------------
CREATE TABLE device_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    fcm_token VARCHAR(500) NOT NULL,
    device_os VARCHAR(20) NOT NULL,
    app_version VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_device_fcm_token UNIQUE (fcm_token),
    CONSTRAINT chk_device_os CHECK (device_os IN ('ANDROID', 'IOS', 'WEB'))
);

COMMENT ON TABLE device_tokens IS 'Registered Expo and FCM push notification tokens for mobile and web clients';

-- ----------------------------------------------------------------------------
-- 2. Table: notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    payload JSONB,
    related_weather_alert_id UUID REFERENCES weather_alerts(alert_id) ON DELETE SET NULL,
    related_case_id UUID REFERENCES emergency_cases(case_id) ON DELETE SET NULL,
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_type CHECK (
        notification_type IN (
            'PUSH',
            'SMS',
            'EMERGENCY_ALERT',
            'WEATHER_WARNING',
            'CASE_STATUS_UPDATE'
        )
    )
);

COMMENT ON TABLE notifications IS 'Parent broadcast intents and targeted notification payloads';

-- ----------------------------------------------------------------------------
-- 3. Table: notification_recipients
-- ----------------------------------------------------------------------------
CREATE TABLE notification_recipients (
    recipient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    phone_number VARCHAR(20),
    target_channel VARCHAR(20) NOT NULL,
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_notif_user_channel UNIQUE (notification_id, user_id, target_channel),
    CONSTRAINT chk_target_channel CHECK (target_channel IN ('PUSH', 'SMS', 'IN_APP')),
    CONSTRAINT chk_delivery_status CHECK (
        delivery_status IN (
            'PENDING',
            'SENT',
            'DELIVERED',
            'FAILED',
            'BOUNCED'
        )
    )
);

COMMENT ON TABLE notification_recipients IS 'Recipient dispatch status per channel with strict provider verification states';

-- ----------------------------------------------------------------------------
-- 4. Table: notification_delivery_logs
-- ----------------------------------------------------------------------------
CREATE TABLE notification_delivery_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES notification_recipients(recipient_id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,
    provider_message_id VARCHAR(150),
    event_type VARCHAR(50) NOT NULL,
    provider_response_code VARCHAR(50),
    provider_raw_response JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_provider_event CHECK (
        event_type IN (
            'SENT',
            'ACKNOWLEDGED',
            'DELIVERED',
            'DELIVERY_FAILED'
        )
    )
);

COMMENT ON TABLE notification_delivery_logs IS 'Immutable provider callback receipts validating genuine SMS/Push delivery';

-- >>> END V8__create_notification_management.sql <<<

-- >>> BEGIN V9__create_audit_and_security.sql <<<
-- ============================================================================
-- Migration: V9__create_audit_and_security.sql
-- Description: Security audit trail, DPDP consent tracking, and sensitive data access logs
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: audit_logs
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_affected VARCHAR(100) NOT NULL,
    entity_id UUID,
    relevant_changes JSONB,
    operation_status VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_audit_action CHECK (
        action IN (
            'CREATE',
            'UPDATE',
            'DELETE',
            'LOGIN',
            'LOGOUT',
            'EXPORT',
            'STATUS_CHANGE'
        )
    ),
    CONSTRAINT chk_audit_status CHECK (operation_status IN ('SUCCESS', 'FAILURE', 'UNAUTHORIZED'))
);

COMMENT ON TABLE audit_logs IS 'Immutable compliance audit trail logging administrative modifications and security events';
COMMENT ON COLUMN audit_logs.user_id IS 'SET NULL on user deletion prevents loss of system audit logs';
COMMENT ON COLUMN audit_logs.relevant_changes IS 'Sanitized JSON diff excluding raw passwords and sensitive medical records';

-- ----------------------------------------------------------------------------
-- 2. Table: consent_records
-- ----------------------------------------------------------------------------
CREATE TABLE consent_records (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES vulnerable_persons(person_id) ON DELETE CASCADE,
    consenting_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    consent_type VARCHAR(50) NOT NULL,
    consent_status VARCHAR(30) NOT NULL,
    consent_document_hash VARCHAR(128),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    ip_address VARCHAR(45),
    CONSTRAINT chk_consent_type CHECK (
        consent_type IN (
            'LOCATION_TRACKING',
            'MEDICAL_SHARING',
            'EMERGENCY_EVACUATION',
            'CAREGIVER_PROXY'
        )
    ),
    CONSTRAINT chk_consent_status CHECK (consent_status IN ('GRANTED', 'WITHDRAWN', 'EXPIRED')),
    CONSTRAINT chk_revoked_after_granted CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);

COMMENT ON TABLE consent_records IS 'Legal consent records compliant with Indian Digital Personal Data Protection Act';

-- ----------------------------------------------------------------------------
-- 3. Table: access_logs
-- ----------------------------------------------------------------------------
CREATE TABLE access_logs (
    access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    accessed_person_id UUID NOT NULL REFERENCES vulnerable_persons(person_id) ON DELETE CASCADE,
    purpose VARCHAR(100) NOT NULL,
    access_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    CONSTRAINT chk_access_purpose CHECK (
        purpose IN (
            'EMERGENCY_DISPATCH',
            'MEDICAL_TRIAGE',
            'AUDIT',
            'ROUTINE_CHECK'
        )
    )
);

COMMENT ON TABLE access_logs IS 'Surveillance log recording every retrieval of sensitive vulnerable individual dossiers';

-- >>> END V9__create_audit_and_security.sql <<<

COMMIT;

-- Verification of Installed Extensions
SELECT extname, extversion FROM pg_extension WHERE extname IN ('postgis', 'uuid-ossp', 'pgcrypto');
