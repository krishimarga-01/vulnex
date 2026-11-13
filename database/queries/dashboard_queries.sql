-- ============================================================================
-- File: queries/dashboard_queries.sql
-- Description: Authority Dashboard KPIs, active threat metrics, and pending case triage
-- Optimizations: Utilizes composite indexes on (current_status, priority, reported_at)
--                and partial index on active vulnerable individuals
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Total Registered Vulnerable Individuals
-- Used for main executive dashboard counter
-- ----------------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_registered_vulnerable,
    COUNT(*) FILTER (WHERE verification_status = 'VERIFIED') AS verified_count,
    COUNT(*) FILTER (WHERE verification_status = 'UNVERIFIED') AS unverified_pending_count
FROM vulnerable_persons
WHERE is_active = TRUE 
  AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 2. Total High-Risk Individuals
-- Filters by the most recent risk assessment for each active vulnerable individual
-- ----------------------------------------------------------------------------
WITH latest_assessments AS (
    SELECT DISTINCT ON (person_id)
        person_id,
        risk_score,
        risk_classification,
        assessed_at
    FROM risk_assessments
    ORDER BY person_id, assessed_at DESC
)
SELECT 
    COUNT(*) AS total_high_risk_individuals
FROM latest_assessments la
JOIN vulnerable_persons vp ON vp.person_id = la.person_id
WHERE la.risk_classification = 'HIGH'
  AND vp.is_active = TRUE
  AND vp.deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 7. Active Weather Warnings
-- Retrieves all currently active meteorological warnings with impacted regions
-- ----------------------------------------------------------------------------
SELECT 
    wa.alert_id,
    wa.alert_title,
    wet.event_name,
    wa.severity,
    wa.alert_status,
    wa.start_time,
    wa.expiration_time,
    STRING_AGG(gr.region_name, ', ' ORDER BY gr.region_name) AS affected_regions,
    ROUND(EXTRACT(EPOCH FROM (wa.expiration_time - CURRENT_TIMESTAMP)) / 3600, 1) AS hours_remaining
FROM weather_alerts wa
JOIN weather_event_types wet ON wet.event_type_id = wa.event_type_id
JOIN weather_alert_regions war ON war.alert_id = wa.alert_id
JOIN geographical_regions gr ON gr.region_id = war.region_id
WHERE wa.alert_status = 'ACTIVE'
  AND CURRENT_TIMESTAMP BETWEEN wa.start_time AND wa.expiration_time
GROUP BY wa.alert_id, wa.alert_title, wet.event_name, wa.severity, wa.alert_status, wa.start_time, wa.expiration_time
ORDER BY 
    CASE wa.severity
        WHEN 'EMERGENCY' THEN 1
        WHEN 'WARNING' THEN 2
        WHEN 'WATCH' THEN 3
        ELSE 4
    END,
    wa.start_time DESC;

-- ----------------------------------------------------------------------------
-- 8. Pending Emergency Cases
-- All open cases that require authority attention or dispatch action
-- ----------------------------------------------------------------------------
SELECT 
    ec.case_id,
    ec.case_number,
    ec.priority,
    ec.current_status,
    ec.reported_at,
    ec.description,
    ec.address_details,
    vp.full_name AS affected_person_name,
    ecat.category_name AS emergency_category,
    rt.team_name AS assigned_team_name,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ec.reported_at)) / 60, 0) AS minutes_since_reported
FROM emergency_cases ec
JOIN vulnerable_persons vp ON vp.person_id = ec.affected_person_id
JOIN emergency_categories ecat ON ecat.category_id = ec.category_id
LEFT JOIN response_teams rt ON rt.team_id = ec.assigned_team_id
WHERE ec.current_status IN ('REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS')
ORDER BY 
    CASE ec.priority
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
    END,
    ec.reported_at ASC;

-- ----------------------------------------------------------------------------
-- 9. High-Priority Emergency Cases
-- Focused view for urgent triage desk (CRITICAL & HIGH priority pending cases)
-- ----------------------------------------------------------------------------
SELECT 
    ec.case_id,
    ec.case_number,
    ec.priority,
    ec.current_status,
    ec.reported_at,
    ec.description,
    vp.full_name AS affected_person,
    vp.primary_phone AS contact_number,
    ec.latitude,
    ec.longitude,
    rt.team_name AS assigned_team
FROM emergency_cases ec
JOIN vulnerable_persons vp ON vp.person_id = ec.affected_person_id
LEFT JOIN response_teams rt ON rt.team_id = ec.assigned_team_id
WHERE ec.priority IN ('CRITICAL', 'HIGH')
  AND ec.current_status NOT IN ('RESOLVED', 'CLOSED')
ORDER BY 
    CASE ec.priority WHEN 'CRITICAL' THEN 1 ELSE 2 END,
    ec.reported_at ASC;

-- ----------------------------------------------------------------------------
-- 11. Number of Resolved and Closed Emergency Cases
-- ----------------------------------------------------------------------------
SELECT 
    COUNT(*) FILTER (WHERE current_status = 'RESOLVED') AS total_resolved_cases,
    COUNT(*) FILTER (WHERE current_status = 'CLOSED') AS total_closed_cases,
    COUNT(*) FILTER (WHERE current_status IN ('RESOLVED', 'CLOSED')) AS total_completed_cases
FROM emergency_cases;

-- ----------------------------------------------------------------------------
-- Executive Single-Call Dashboard KPI Summary Rollup
-- High-speed single round-trip aggregate query for React dashboard header
-- ----------------------------------------------------------------------------
SELECT
    (SELECT COUNT(*) FROM vulnerable_persons WHERE is_active = TRUE AND deleted_at IS NULL) AS total_vulnerable,
    (SELECT COUNT(DISTINCT person_id) FROM risk_assessments WHERE risk_classification = 'HIGH') AS high_risk_count,
    (SELECT COUNT(*) FROM weather_alerts WHERE alert_status = 'ACTIVE' AND CURRENT_TIMESTAMP BETWEEN start_time AND expiration_time) AS active_alerts_count,
    (SELECT COUNT(*) FROM emergency_cases WHERE current_status IN ('REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS')) AS open_emergency_cases,
    (SELECT COUNT(*) FROM emergency_cases WHERE priority = 'CRITICAL' AND current_status NOT IN ('RESOLVED', 'CLOSED')) AS critical_cases_count,
    (SELECT COUNT(*) FROM response_teams WHERE current_availability = 'AVAILABLE') AS ready_response_teams,
    (SELECT COUNT(*) FROM response_teams WHERE current_availability = 'DEPLOYED') AS deployed_response_teams;
