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
