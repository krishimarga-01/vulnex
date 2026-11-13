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
