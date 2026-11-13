-- ============================================================================
-- File: queries/analytics_queries.sql
-- Description: Long-term analytics, demographic distributions, and SLA metrics
-- Optimizations: Grouping over indexed foreign keys and categorization codes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3. Region-wise Vulnerable Population Distribution
-- Provides demographic vulnerability breakdown across all Karnataka regions
-- ----------------------------------------------------------------------------
SELECT 
    gr.region_code,
    gr.region_name,
    gr.district,
    gr.region_risk_level,
    COUNT(vp.person_id) AS total_vulnerable_individuals,
    COUNT(vp.person_id) FILTER (WHERE vp.verification_status = 'VERIFIED') AS verified_individuals,
    COUNT(vp.person_id) FILTER (WHERE vp.age_category = 'SENIOR_CITIZEN') AS elderly_count,
    COUNT(vp.person_id) FILTER (WHERE vp.age_category IN ('INFANT', 'CHILD')) AS children_count,
    ROUND(
        (COUNT(vp.person_id)::numeric / NULLIF((SELECT COUNT(*) FROM vulnerable_persons WHERE is_active = TRUE AND deleted_at IS NULL), 0) * 100),
        1
    ) AS percentage_of_state_total
FROM geographical_regions gr
LEFT JOIN vulnerable_persons vp ON vp.geographical_region_id = gr.region_id 
                               AND vp.is_active = TRUE 
                               AND vp.deleted_at IS NULL
GROUP BY gr.region_id, gr.region_code, gr.region_name, gr.district, gr.region_risk_level
ORDER BY total_vulnerable_individuals DESC;

-- ----------------------------------------------------------------------------
-- 4. Category-wise Population Distribution
-- Breakdown of registered individuals by vulnerability classification
-- ----------------------------------------------------------------------------
SELECT 
    vc.category_code,
    vc.category_name,
    vc.base_vulnerability_weight,
    COUNT(vp.person_id) AS total_population,
    ROUND(AVG(vp.age), 1) AS average_age,
    COUNT(*) FILTER (WHERE vp.gender = 'FEMALE') AS female_count,
    COUNT(*) FILTER (WHERE vp.gender = 'MALE') AS male_count,
    ROUND(
        (COUNT(vp.person_id)::numeric / NULLIF((SELECT COUNT(*) FROM vulnerable_persons WHERE is_active = TRUE AND deleted_at IS NULL), 0) * 100),
        1
    ) AS percentage_share
FROM vulnerability_categories vc
LEFT JOIN vulnerable_persons vp ON vp.primary_category_id = vc.category_id 
                               AND vp.is_active = TRUE 
                               AND vp.deleted_at IS NULL
GROUP BY vc.category_id, vc.category_code, vc.category_name, vc.base_vulnerability_weight
ORDER BY total_population DESC;

-- ----------------------------------------------------------------------------
-- 12. Average Emergency Response and Resolution Time (SLA Analytics)
-- Computes average dispatch latency (reported_at -> assigned_at)
-- and average resolution latency (reported_at -> resolved_at) in minutes and hours
-- ----------------------------------------------------------------------------
SELECT 
    ec.priority,
    COUNT(*) AS total_cases,
    COUNT(ec.assigned_at) AS assigned_cases,
    ROUND(AVG(EXTRACT(EPOCH FROM (ec.assigned_at - ec.reported_at)) / 60)::numeric, 1) AS avg_dispatch_minutes,
    COUNT(ec.resolved_at) AS resolved_cases,
    ROUND(AVG(EXTRACT(EPOCH FROM (ec.resolved_at - ec.reported_at)) / 3600)::numeric, 2) AS avg_resolution_hours,
    MIN(EXTRACT(EPOCH FROM (ec.assigned_at - ec.reported_at)) / 60) AS min_dispatch_minutes,
    MAX(EXTRACT(EPOCH FROM (ec.assigned_at - ec.reported_at)) / 60) AS max_dispatch_minutes
FROM emergency_cases ec
GROUP BY ec.priority
ORDER BY 
    CASE ec.priority
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
    END;

-- ----------------------------------------------------------------------------
-- 13. Risk Distribution by Region
-- Cross-tabulation of latest risk classifications (LOW, MEDIUM, HIGH) per region
-- ----------------------------------------------------------------------------
WITH latest_person_risk AS (
    SELECT DISTINCT ON (person_id)
        person_id,
        risk_classification,
        risk_score,
        assessed_at
    FROM risk_assessments
    ORDER BY person_id, assessed_at DESC
)
SELECT 
    gr.region_name,
    gr.district,
    COUNT(lpr.person_id) AS total_assessed,
    COUNT(*) FILTER (WHERE lpr.risk_classification = 'HIGH') AS high_risk_count,
    COUNT(*) FILTER (WHERE lpr.risk_classification = 'MEDIUM') AS medium_risk_count,
    COUNT(*) FILTER (WHERE lpr.risk_classification = 'LOW') AS low_risk_count,
    ROUND(AVG(lpr.risk_score), 2) AS average_risk_score
FROM geographical_regions gr
JOIN vulnerable_persons vp ON vp.geographical_region_id = gr.region_id
LEFT JOIN latest_person_risk lpr ON lpr.person_id = vp.person_id
WHERE vp.is_active = TRUE AND vp.deleted_at IS NULL
GROUP BY gr.region_id, gr.region_name, gr.district
ORDER BY high_risk_count DESC, average_risk_score DESC;

-- ----------------------------------------------------------------------------
-- 15. Notification Delivery Statistics & Provider Reliability
-- Tracks total sent, confirmed delivered, failed, and delivery success rate %
-- ----------------------------------------------------------------------------
SELECT 
    nr.target_channel,
    COUNT(*) AS total_dispatched,
    COUNT(*) FILTER (WHERE nr.delivery_status = 'DELIVERED') AS successfully_delivered,
    COUNT(*) FILTER (WHERE nr.delivery_status = 'FAILED') AS failed_deliveries,
    COUNT(*) FILTER (WHERE nr.delivery_status = 'PENDING') AS pending_confirmations,
    ROUND(
        (COUNT(*) FILTER (WHERE nr.delivery_status = 'DELIVERED')::numeric / NULLIF(COUNT(*), 0) * 100),
        2
    ) AS delivery_success_rate_pct,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (nr.delivered_at - nr.sent_at)))::numeric,
        1
    ) AS avg_delivery_latency_seconds
FROM notification_recipients nr
GROUP BY nr.target_channel
ORDER BY nr.target_channel;

-- ----------------------------------------------------------------------------
-- Weather Alert Impact Cross-Tabulation
-- Number of vulnerable individuals currently exposed to active meteorological warnings
-- ----------------------------------------------------------------------------
SELECT 
    wa.alert_title,
    wet.event_name,
    wa.severity,
    COUNT(DISTINCT war.region_id) AS impacted_regions_count,
    COUNT(DISTINCT vp.person_id) AS total_vulnerable_in_impact_zone,
    COUNT(DISTINCT vp.person_id) FILTER (WHERE vp.primary_category_id = 'b0000000-0000-0000-0000-000000000001') AS elderly_in_impact_zone,
    COUNT(DISTINCT vp.person_id) FILTER (WHERE vp.primary_category_id = 'b0000000-0000-0000-0000-000000000005') AS medical_dependent_in_impact_zone
FROM weather_alerts wa
JOIN weather_event_types wet ON wet.event_type_id = wa.event_type_id
JOIN weather_alert_regions war ON war.alert_id = wa.alert_id
LEFT JOIN vulnerable_persons vp ON vp.geographical_region_id = war.region_id 
                                AND vp.is_active = TRUE 
                                AND vp.deleted_at IS NULL
WHERE wa.alert_status = 'ACTIVE'
GROUP BY wa.alert_id, wa.alert_title, wet.event_name, wa.severity
ORDER BY total_vulnerable_in_impact_zone DESC;
