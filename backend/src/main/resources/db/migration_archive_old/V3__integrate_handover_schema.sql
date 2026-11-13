-- ============================================================================
-- Migration: V3__integrate_handover_schema.sql
-- Description: Seamlessly integrates the 38-table database handover schema
--              into the Extreme Weather Emergency Response System.
--              Enhances baseline tables with UUID identifiers and adds
--              shelters, hazard zones, audit trails, and DPDP consent tracking.
-- ============================================================================

-- Ensure required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Utility Trigger Function: updated_at maintenance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. ENHANCE BASELINE TABLES WITH UUIDs & EXTENDED ATTRIBUTES
-- ----------------------------------------------------------------------------

-- Table: roles
ALTER TABLE roles ADD COLUMN IF NOT EXISTS role_id UUID DEFAULT gen_random_uuid();
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_roles_role_id') THEN
        ALTER TABLE roles ADD CONSTRAINT uq_roles_role_id UNIQUE (role_id);
    END IF;
END $$;

-- Table: users
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT gen_random_uuid();
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_users_user_id') THEN
        ALTER TABLE users ADD CONSTRAINT uq_users_user_id UNIQUE (user_id);
    END IF;
END $$;

-- Table: vulnerable_persons
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS person_id UUID DEFAULT gen_random_uuid();
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS age_category VARCHAR(30) DEFAULT 'ADULT';
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS primary_category_id UUID;
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS geographical_region_id UUID;
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS village_or_locality VARCHAR(100);
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS taluk VARCHAR(100);
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT 'Bengaluru';
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Karnataka';
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS postal_code VARCHAR(15);
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS verified_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS consent_status VARCHAR(30) DEFAULT 'GIVEN';
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS consent_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS medical_notes_encrypted TEXT;
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE vulnerable_persons ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_vulnerable_persons_person_id') THEN
        ALTER TABLE vulnerable_persons ADD CONSTRAINT uq_vulnerable_persons_person_id UNIQUE (person_id);
    END IF;
END $$;

-- Table: caregiver_relationships
ALTER TABLE caregiver_relationships ADD COLUMN IF NOT EXISTS relationship_id UUID DEFAULT gen_random_uuid();
ALTER TABLE caregiver_relationships ADD COLUMN IF NOT EXISTS emergency_authorization BOOLEAN NOT NULL DEFAULT TRUE;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_caregiver_rel_id') THEN
        ALTER TABLE caregiver_relationships ADD CONSTRAINT uq_caregiver_rel_id UNIQUE (relationship_id);
    END IF;
END $$;

-- Table: geographical_regions
ALTER TABLE geographical_regions ADD COLUMN IF NOT EXISTS region_id UUID DEFAULT gen_random_uuid();
ALTER TABLE geographical_regions ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Karnataka';
ALTER TABLE geographical_regions ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT 'Bengaluru';
ALTER TABLE geographical_regions ADD COLUMN IF NOT EXISTS taluk VARCHAR(100);
ALTER TABLE geographical_regions ADD COLUMN IF NOT EXISTS village_or_locality VARCHAR(100);
ALTER TABLE geographical_regions ADD COLUMN IF NOT EXISTS centroid geometry(Point, 4326);
ALTER TABLE geographical_regions ADD COLUMN IF NOT EXISTS region_risk_level VARCHAR(20) DEFAULT 'LOW';
ALTER TABLE geographical_regions ADD COLUMN IF NOT EXISTS elevation_meters NUMERIC(8, 2);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_regions_region_id') THEN
        ALTER TABLE geographical_regions ADD CONSTRAINT uq_regions_region_id UNIQUE (region_id);
    END IF;
END $$;

-- Table: weather_observations
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS observation_id UUID DEFAULT gen_random_uuid();
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS source_station_id VARCHAR(100);
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS weather_provider VARCHAR(100) DEFAULT 'OPEN_METEO';
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS temperature_celsius NUMERIC(5, 2);
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS relative_humidity_percent NUMERIC(5, 2);
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS rainfall_mm NUMERIC(7, 2);
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS wind_speed_kmh NUMERIC(6, 2);
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS wind_gust_kmh NUMERIC(6, 2);
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS atmospheric_pressure_hpa NUMERIC(7, 2);
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS heat_index_celsius NUMERIC(5, 2);
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS raw_payload JSONB;
ALTER TABLE weather_observations ADD COLUMN IF NOT EXISTS observation_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_weather_obs_id') THEN
        ALTER TABLE weather_observations ADD CONSTRAINT uq_weather_obs_id UNIQUE (observation_id);
    END IF;
END $$;

-- Table: weather_alerts
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS alert_id UUID DEFAULT gen_random_uuid();
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS external_source_id VARCHAR(100);
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS event_type_id UUID;
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS alert_title VARCHAR(200);
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS instruction TEXT;
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS expiration_time TIMESTAMPTZ;
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS alert_status VARCHAR(30) DEFAULT 'ACTIVE';
ALTER TABLE weather_alerts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_weather_alerts_id') THEN
        ALTER TABLE weather_alerts ADD CONSTRAINT uq_weather_alerts_id UNIQUE (alert_id);
    END IF;
END $$;

-- Table: risk_scoring_rules
ALTER TABLE risk_scoring_rules ADD COLUMN IF NOT EXISTS rule_id UUID DEFAULT gen_random_uuid();
ALTER TABLE risk_scoring_rules ADD COLUMN IF NOT EXISTS rule_version VARCHAR(30);
ALTER TABLE risk_scoring_rules ADD COLUMN IF NOT EXISTS rule_name VARCHAR(150);
ALTER TABLE risk_scoring_rules ADD COLUMN IF NOT EXISTS parameters JSONB;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_risk_rules_id') THEN
        ALTER TABLE risk_scoring_rules ADD CONSTRAINT uq_risk_rules_id UNIQUE (rule_id);
    END IF;
END $$;

-- Table: risk_assessments
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS assessment_id UUID DEFAULT gen_random_uuid();
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS person_id UUID;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS rule_id UUID;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS risk_score NUMERIC(5, 2);
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS risk_classification VARCHAR(20);
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS assessment_explanation TEXT;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_risk_assessments_id') THEN
        ALTER TABLE risk_assessments ADD CONSTRAINT uq_risk_assessments_id UNIQUE (assessment_id);
    END IF;
END $$;

-- Table: response_teams
ALTER TABLE response_teams ADD COLUMN IF NOT EXISTS team_id UUID DEFAULT gen_random_uuid();
ALTER TABLE response_teams ADD COLUMN IF NOT EXISTS team_code VARCHAR(50);
ALTER TABLE response_teams ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE response_teams ADD COLUMN IF NOT EXISTS base_region_id UUID;
ALTER TABLE response_teams ADD COLUMN IF NOT EXISTS current_availability VARCHAR(30) DEFAULT 'AVAILABLE';
ALTER TABLE response_teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_response_teams_id') THEN
        ALTER TABLE response_teams ADD CONSTRAINT uq_response_teams_id UNIQUE (team_id);
    END IF;
END $$;

-- Table: emergency_cases
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS case_id UUID DEFAULT gen_random_uuid();
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS reporter_id UUID;
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS weather_alert_id BIGINT REFERENCES weather_alerts(id) ON DELETE SET NULL;
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS weather_alert_id_uuid UUID;
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS address_details TEXT;
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS current_status VARCHAR(30) DEFAULT 'REPORTED';
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS reported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE emergency_cases ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_emergency_cases_id') THEN
        ALTER TABLE emergency_cases ADD CONSTRAINT uq_emergency_cases_id UNIQUE (case_id);
    END IF;
END $$;

-- Table: case_assignments
ALTER TABLE case_assignments ADD COLUMN IF NOT EXISTS assignment_id UUID DEFAULT gen_random_uuid();
ALTER TABLE case_assignments ADD COLUMN IF NOT EXISTS assignment_notes TEXT;
ALTER TABLE case_assignments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE case_assignments ADD COLUMN IF NOT EXISTS assignment_status VARCHAR(30) DEFAULT 'ACTIVE';
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_case_assignments_id') THEN
        ALTER TABLE case_assignments ADD CONSTRAINT uq_case_assignments_id UNIQUE (assignment_id);
    END IF;
END $$;

-- Table: notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_id UUID DEFAULT gen_random_uuid();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_weather_alert_id BIGINT REFERENCES weather_alerts(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_case_id BIGINT REFERENCES emergency_cases(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_notifications_id') THEN
        ALTER TABLE notifications ADD CONSTRAINT uq_notifications_id UNIQUE (notification_id);
    END IF;
END $$;

-- Table: notification_delivery_logs
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS log_id UUID DEFAULT gen_random_uuid();
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS recipient_id UUID;
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS provider_name VARCHAR(50) DEFAULT 'SYSTEM';
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'SENT';
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS provider_response_code VARCHAR(50);
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS provider_raw_response JSONB;
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_notif_logs_id') THEN
        ALTER TABLE notification_delivery_logs ADD CONSTRAINT uq_notif_logs_id UNIQUE (log_id);
    END IF;
END $$;

-- Table: audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS audit_id UUID DEFAULT gen_random_uuid();
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_affected VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS relevant_changes JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS operation_status VARCHAR(20) DEFAULT 'SUCCESS';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_audit_logs_id') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT uq_audit_logs_id UNIQUE (audit_id);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. CREATE NEW EXTENSION TABLES (FROM HANDOVER SCHEMA)
-- ----------------------------------------------------------------------------

-- 2.1 User Roles Junction
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 2.2 User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 User Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    priority_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Vulnerability Categories Master
CREATE TABLE IF NOT EXISTS vulnerability_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_vulnerability_weight NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.5 Assistance Requirements Master
CREATE TABLE IF NOT EXISTS assistance_requirements (
    requirement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_code VARCHAR(50) NOT NULL UNIQUE,
    requirement_name VARCHAR(100) NOT NULL,
    priority_level VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.6 Person Assistance Requirements Junction
CREATE TABLE IF NOT EXISTS person_assistance_requirements (
    person_id UUID NOT NULL,
    requirement_id UUID NOT NULL,
    notes TEXT,
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (person_id, requirement_id)
);

-- 2.7 Person Emergency Contacts
CREATE TABLE IF NOT EXISTS person_emergency_contacts (
    person_contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    priority_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.8 Dynamic Hazard Danger Zones
CREATE TABLE IF NOT EXISTS affected_zones (
    zone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name VARCHAR(150) NOT NULL,
    hazard_type VARCHAR(50) NOT NULL,
    severity_level VARCHAR(20) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_by_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.9 Emergency Relief Shelters
CREATE TABLE IF NOT EXISTS shelters (
    shelter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shelter_code VARCHAR(50) NOT NULL UNIQUE,
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.10 Shelter Capacity & Live Occupancy
CREATE TABLE IF NOT EXISTS shelter_capacity (
    capacity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shelter_id UUID NOT NULL UNIQUE REFERENCES shelters(shelter_id) ON DELETE CASCADE,
    total_capacity INT NOT NULL,
    current_occupancy INT NOT NULL DEFAULT 0,
    special_care_capacity INT NOT NULL DEFAULT 0,
    special_care_occupancy INT NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id UUID
);

-- 2.11 Weather Event Types
CREATE TABLE IF NOT EXISTS weather_event_types (
    event_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_code VARCHAR(50) NOT NULL UNIQUE,
    event_name VARCHAR(100) NOT NULL,
    severity_scale_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.12 Weather Alert Affected Regions
CREATE TABLE IF NOT EXISTS weather_alert_regions (
    alert_id UUID NOT NULL,
    region_id UUID NOT NULL,
    PRIMARY KEY (alert_id, region_id)
);

-- 2.13 Risk Assessment Factors Breakdown
CREATE TABLE IF NOT EXISTS risk_assessment_factors (
    factor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL,
    factor_name VARCHAR(100) NOT NULL,
    factor_weight NUMERIC(5, 2) NOT NULL,
    factor_score NUMERIC(5, 2) NOT NULL,
    factor_detail JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.14 Emergency Incident Categories
CREATE TABLE IF NOT EXISTS emergency_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    priority_weight INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.15 Emergency Case Updates Timeline
CREATE TABLE IF NOT EXISTS emergency_case_updates (
    update_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    notes TEXT NOT NULL,
    updated_by_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.16 Incident Case Attachments
CREATE TABLE IF NOT EXISTS case_attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_by_user_id UUID,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.17 Response Team Members Roster
CREATE TABLE IF NOT EXISTS response_team_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    user_id UUID NOT NULL,
    member_role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_team_user UNIQUE (team_id, user_id)
);

-- 2.18 Response Team Live GPS Telemetry
CREATE TABLE IF NOT EXISTS response_team_locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    speed_kmh NUMERIC(5, 2),
    battery_level_percent INT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.19 Response Team Shift & Availability
CREATE TABLE IF NOT EXISTS team_availability (
    availability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    reason_or_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.20 Push Device Notification Tokens
CREATE TABLE IF NOT EXISTS device_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    fcm_token VARCHAR(500) NOT NULL UNIQUE,
    device_os VARCHAR(20) NOT NULL,
    app_version VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.21 Notification Multi-Channel Recipients
CREATE TABLE IF NOT EXISTS notification_recipients (
    recipient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    user_id UUID NOT NULL,
    phone_number VARCHAR(20),
    target_channel VARCHAR(20) NOT NULL,
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.22 Indian DPDP Compliance Consent Records
CREATE TABLE IF NOT EXISTS consent_records (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL,
    consenting_user_id UUID NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    consent_status VARCHAR(30) NOT NULL,
    consent_document_hash VARCHAR(128),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    ip_address VARCHAR(45)
);

-- 2.23 PII Medical Dossier Access Surveillance Logs
CREATE TABLE IF NOT EXISTS access_logs (
    access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    accessed_person_id UUID NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    access_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);
