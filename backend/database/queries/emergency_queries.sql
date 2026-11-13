-- ============================================================================
-- File: queries/emergency_queries.sql
-- Description: Emergency response operations, team assignments, and case workflows
-- Optimizations: Exploits composite index on (current_status, priority, reported_at)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 10. Emergency Cases Assigned to a Specific Response Team
-- E.g. SDRF Coastal Marine Rescue Unit Karwar (40000000-0000-0000-0000-000000000002)
-- ----------------------------------------------------------------------------
SELECT 
    ec.case_id,
    ec.case_number,
    ec.priority,
    ec.current_status,
    ec.description,
    ec.address_details,
    ec.latitude,
    ec.longitude,
    vp.full_name AS affected_person_name,
    vp.primary_phone AS contact_phone,
    ca.assigned_at,
    ca.assignment_notes,
    rt.team_name,
    rt.contact_phone AS team_phone,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ca.assigned_at)) / 60, 0) AS minutes_dispatched
FROM emergency_cases ec
JOIN case_assignments ca ON ca.case_id = ec.case_id
JOIN response_teams rt ON rt.team_id = ca.team_id
JOIN vulnerable_persons vp ON vp.person_id = ec.affected_person_id
WHERE ca.team_id = '40000000-0000-0000-0000-000000000002'
  AND ca.assignment_status = 'ACTIVE'
ORDER BY 
    CASE ec.priority
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
    END,
    ca.assigned_at ASC;

-- ----------------------------------------------------------------------------
-- Complete Case Status Timeline and Field Audit Trail
-- Retrieves chronological history of status updates and notes for an incident
-- ----------------------------------------------------------------------------
SELECT 
    ec.case_number,
    ecu.update_id,
    ecu.previous_status,
    ecu.new_status,
    ecu.notes,
    u.full_name AS updated_by_user,
    ecu.created_at AS transition_timestamp
FROM emergency_case_updates ecu
JOIN emergency_cases ec ON ec.case_id = ecu.case_id
LEFT JOIN users u ON u.user_id = ecu.updated_by_user_id
WHERE ec.case_number = 'EMG-2026-0001'
ORDER BY ecu.created_at ASC;

-- ----------------------------------------------------------------------------
-- Emergency Cases Requiring Urgent Medical / Life-Support Equipment
-- Cross-references open emergency cases with vulnerable individual assistance requirements
-- ----------------------------------------------------------------------------
SELECT 
    ec.case_number,
    ec.priority,
    ec.current_status,
    vp.full_name AS patient_name,
    vp.age,
    ar.requirement_name AS special_equipment_needed,
    ar.priority_level AS requirement_priority,
    par.notes AS assistance_notes,
    ec.description AS case_description
FROM emergency_cases ec
JOIN vulnerable_persons vp ON vp.person_id = ec.affected_person_id
JOIN person_assistance_requirements par ON par.person_id = vp.person_id
JOIN assistance_requirements ar ON ar.requirement_id = par.requirement_id
WHERE ec.current_status NOT IN ('RESOLVED', 'CLOSED')
  AND ar.priority_level IN ('CRITICAL', 'URGENT')
ORDER BY 
    CASE ec.priority WHEN 'CRITICAL' THEN 1 ELSE 2 END,
    ec.reported_at ASC;

-- ----------------------------------------------------------------------------
-- Response Team Field Deployment & Roster Status
-- Overview of response teams, active assignments, and roster sizes
-- ----------------------------------------------------------------------------
SELECT 
    rt.team_code,
    rt.team_name,
    rt.team_type,
    rt.current_availability,
    gr.region_name AS base_station_region,
    COUNT(DISTINCT rtm.member_id) AS deployed_crew_count,
    COUNT(DISTINCT ca.assignment_id) FILTER (WHERE ca.assignment_status = 'ACTIVE') AS active_incident_count
FROM response_teams rt
LEFT JOIN geographical_regions gr ON gr.region_id = rt.base_region_id
LEFT JOIN response_team_members rtm ON rtm.team_id = rt.team_id AND rtm.is_active = TRUE
LEFT JOIN case_assignments ca ON ca.team_id = rt.team_id
GROUP BY rt.team_id, rt.team_code, rt.team_name, rt.team_type, rt.current_availability, gr.region_name
ORDER BY active_incident_count DESC, rt.team_name;

-- ----------------------------------------------------------------------------
-- Data Protection & Integrity Verification: User Soft-Delete Safety
-- Verifies that soft-deleting a citizen account preserves emergency ticket history
-- ----------------------------------------------------------------------------
SELECT 
    ec.case_number,
    ec.current_status,
    ec.priority,
    u.full_name AS reporter_name,
    u.account_status,
    u.deleted_at AS reporter_soft_delete_date,
    CASE 
        WHEN u.deleted_at IS NOT NULL THEN 'PRESERVED_POST_DELETION'
        ELSE 'ACTIVE_USER'
    END AS audit_integrity_status
FROM emergency_cases ec
JOIN users u ON u.user_id = ec.reporter_id
ORDER BY ec.reported_at DESC;
