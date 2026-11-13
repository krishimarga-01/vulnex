-- ====================================================================
-- Flyway Migration V1: Initial Schema for Extreme Weather System
-- Compatible with PostgreSQL 15+ and PostGIS
-- ====================================================================

-- Enable PostGIS extension if available
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(50) NOT NULL,
    account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    fcm_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 3. VULNERABLE PERSONS TABLE
CREATE TABLE IF NOT EXISTS vulnerable_persons (
    id BIGSERIAL PRIMARY KEY,
    national_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    age INT NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    vulnerability_category VARCHAR(50) NOT NULL,
    medical_conditions TEXT,
    mobility_status VARCHAR(50) DEFAULT 'INDEPENDENT',
    assistance_requirements TEXT,
    contact_number VARCHAR(30),
    address TEXT,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    emergency_contact_relationship VARCHAR(50),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location geometry(Point, 4326),
    registered_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    caregiver_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    consent_given BOOLEAN NOT NULL DEFAULT TRUE,
    current_risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    current_risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vulnerable_category ON vulnerable_persons(vulnerability_category);
CREATE INDEX idx_vulnerable_risk_level ON vulnerable_persons(current_risk_level);
CREATE INDEX idx_vulnerable_caregiver ON vulnerable_persons(caregiver_user_id);
CREATE INDEX idx_vulnerable_location ON vulnerable_persons USING GIST(location);

-- 4. CAREGIVER RELATIONSHIPS TABLE
CREATE TABLE IF NOT EXISTS caregiver_relationships (
    id BIGSERIAL PRIMARY KEY,
    caregiver_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vulnerable_person_id BIGINT NOT NULL REFERENCES vulnerable_persons(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_caregiver_person UNIQUE (caregiver_user_id, vulnerable_person_id)
);

-- 5. GEOGRAPHICAL REGIONS TABLE
CREATE TABLE IF NOT EXISTS geographical_regions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    region_code VARCHAR(50) NOT NULL UNIQUE,
    region_type VARCHAR(50) NOT NULL,
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    boundary geometry(Polygon, 4326),
    current_risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    active_alert_count INT NOT NULL DEFAULT 0,
    population INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regions_risk_level ON geographical_regions(current_risk_level);
CREATE INDEX idx_regions_boundary ON geographical_regions USING GIST(boundary);

-- 6. WEATHER OBSERVATIONS TABLE
CREATE TABLE IF NOT EXISTS weather_observations (
    id BIGSERIAL PRIMARY KEY,
    region_id BIGINT REFERENCES geographical_regions(id) ON DELETE SET NULL,
    region_name VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    feels_like DOUBLE PRECISION,
    precipitation DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    wind_speed DOUBLE PRECISION NOT NULL,
    weather_condition VARCHAR(100) NOT NULL,
    is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weather_observed_at ON weather_observations(observed_at);
CREATE INDEX idx_weather_region ON weather_observations(region_id);

-- 7. WEATHER ALERTS TABLE
CREATE TABLE IF NOT EXISTS weather_alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_code VARCHAR(50) NOT NULL UNIQUE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    safety_instructions TEXT,
    affected_region_name VARCHAR(150) NOT NULL,
    boundary geometry(Polygon, 4326),
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    issued_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weather_alerts_active ON weather_alerts(is_active);
CREATE INDEX idx_weather_alerts_type ON weather_alerts(alert_type);
CREATE INDEX idx_weather_alerts_severity ON weather_alerts(severity);
CREATE INDEX idx_weather_alerts_boundary ON weather_alerts USING GIST(boundary);

-- 8. RISK SCORING RULES TABLE
CREATE TABLE IF NOT EXISTS risk_scoring_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    condition_field VARCHAR(100) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    threshold_value VARCHAR(100) NOT NULL,
    score_weight DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. RISK ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    vulnerable_person_id BIGINT NOT NULL REFERENCES vulnerable_persons(id) ON DELETE CASCADE,
    weather_alert_id BIGINT REFERENCES weather_alerts(id) ON DELETE SET NULL,
    calculated_score DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    breakdown_json TEXT NOT NULL,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assessed_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM'
);

CREATE INDEX idx_risk_assessments_person ON risk_assessments(vulnerable_person_id);
CREATE INDEX idx_risk_assessments_level ON risk_assessments(risk_level);

-- 10. RESPONSE TEAMS TABLE
CREATE TABLE IF NOT EXISTS response_teams (
    id BIGSERIAL PRIMARY KEY,
    team_name VARCHAR(150) NOT NULL,
    team_type VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    base_location_name VARCHAR(150) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    current_capacity INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. EMERGENCY CASES TABLE
CREATE TABLE IF NOT EXISTS emergency_cases (
    id BIGSERIAL PRIMARY KEY,
    case_number VARCHAR(50) NOT NULL UNIQUE,
    reporter_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    affected_person_id BIGINT REFERENCES vulnerable_persons(id) ON DELETE SET NULL,
    emergency_category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location geometry(Point, 4326),
    address TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
    resolution_details TEXT,
    assigned_team_id BIGINT REFERENCES response_teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_emergency_status ON emergency_cases(status);
CREATE INDEX idx_emergency_priority ON emergency_cases(priority);
CREATE INDEX idx_emergency_category ON emergency_cases(emergency_category);
CREATE INDEX idx_emergency_location ON emergency_cases USING GIST(location);

-- 12. CASE ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS case_assignments (
    id BIGSERIAL PRIMARY KEY,
    emergency_case_id BIGINT NOT NULL REFERENCES emergency_cases(id) ON DELETE CASCADE,
    response_team_id BIGINT NOT NULL REFERENCES response_teams(id) ON DELETE CASCADE,
    assigned_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    target_entity_type VARCHAR(50),
    target_entity_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);

-- 14. NOTIFICATION DELIVERY LOGS TABLE
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES notifications(id) ON DELETE CASCADE,
    channel VARCHAR(30) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    attempt_count INT NOT NULL DEFAULT 1,
    provider_response TEXT,
    provider_message_id VARCHAR(100),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_logs_status ON notification_delivery_logs(delivery_status);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource_name VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_time ON audit_logs(created_at);
