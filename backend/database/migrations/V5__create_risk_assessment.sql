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
