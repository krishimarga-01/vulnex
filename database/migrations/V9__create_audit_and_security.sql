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
