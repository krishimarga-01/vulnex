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
