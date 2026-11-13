-- ============================================================================
-- File: queries/geographical_queries.sql
-- Description: PostGIS spatial queries for proximity, hazard intersections, and boundaries
-- Optimizations: Exploits GiST spatial indexes on location and boundary geometries
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5. People Affected by a Particular Weather Alert
-- Finds all vulnerable individuals residing in the geographical regions
-- mapped to an active alert (e.g. Kodagu Flash Flood: 50000000-0000-0000-0000-000000000001)
-- ----------------------------------------------------------------------------
SELECT 
    wa.alert_title,
    wa.severity,
    gr.region_name,
    gr.district,
    vp.person_id,
    vp.full_name,
    vp.age,
    vc.category_name AS vulnerability_type,
    vp.primary_phone,
    vp.village_or_locality,
    vp.latitude,
    vp.longitude
FROM weather_alerts wa
JOIN weather_alert_regions war ON war.alert_id = wa.alert_id
JOIN geographical_regions gr ON gr.region_id = war.region_id
JOIN vulnerable_persons vp ON vp.geographical_region_id = gr.region_id
JOIN vulnerability_categories vc ON vc.category_id = vp.primary_category_id
WHERE wa.alert_id = '50000000-0000-0000-0000-000000000001'
  AND vp.is_active = TRUE
  AND vp.deleted_at IS NULL
ORDER BY vp.full_name;

-- ----------------------------------------------------------------------------
-- 6. People Located Inside an Affected Geographical Hazard Boundary
-- Uses PostGIS ST_Within / ST_Contains to locate individuals physically
-- located inside real-time danger polygons (e.g. Bhagamandala Flash Flood Basin)
-- ----------------------------------------------------------------------------
SELECT 
    az.zone_name,
    az.hazard_type,
    az.severity_level,
    vp.person_id,
    vp.full_name,
    vp.age,
    vc.category_name AS vulnerability_category,
    vp.primary_phone,
    vp.address_line,
    ROUND(ST_Y(vp.location)::numeric, 4) AS latitude,
    ROUND(ST_X(vp.location)::numeric, 4) AS longitude,
    ST_AsText(vp.location) AS point_wkt
FROM affected_zones az
JOIN vulnerable_persons vp ON ST_Within(vp.location, az.boundary)
JOIN vulnerability_categories vc ON vc.category_id = vp.primary_category_id
WHERE az.is_active = TRUE
  AND CURRENT_TIMESTAMP BETWEEN az.effective_from AND COALESCE(az.effective_to, CURRENT_TIMESTAMP + INTERVAL '1 day')
  AND vp.is_active = TRUE
  AND vp.deleted_at IS NULL
ORDER BY az.zone_name, vp.full_name;

-- ----------------------------------------------------------------------------
-- 14. Nearby Emergency Shelters within 15 km Radius
-- Given an incident coordinate (e.g. Bhagamandala: Lon 75.7250, Lat 12.4180),
-- calculates exact spherical geodesic distance in meters and kilometers,
-- ordered by closest shelter, displaying live available capacity.
-- ----------------------------------------------------------------------------
SELECT 
    s.shelter_id,
    s.shelter_code,
    s.shelter_name,
    s.shelter_type,
    s.address,
    s.contact_person_name,
    s.contact_phone,
    s.is_accessible_disabled,
    s.has_medical_facility,
    sc.total_capacity,
    sc.current_occupancy,
    sc.available_capacity,
    sc.special_care_capacity - sc.special_care_occupancy AS available_special_care_beds,
    ROUND(
        (ST_Distance(s.location::geography, ST_SetSRID(ST_Point(75.7250, 12.4180), 4326)::geography) / 1000)::numeric,
        2
    ) AS distance_km
FROM shelters s
JOIN shelter_capacity sc ON sc.shelter_id = s.shelter_id
WHERE s.status = 'ACTIVE'
  AND ST_DWithin(
        s.location::geography,
        ST_SetSRID(ST_Point(75.7250, 12.4180), 4326)::geography,
        25000 -- 25,000 meters (25 km search perimeter)
  )
ORDER BY distance_km ASC;

-- ----------------------------------------------------------------------------
-- Find Nearest Available Response Team to an Incident
-- Uses PostGIS ST_Distance to find the closest AVAILABLE response team
-- based on their latest telemetry location to dispatch to an emergency case
-- ----------------------------------------------------------------------------
WITH latest_team_positions AS (
    SELECT DISTINCT ON (team_id)
        team_id,
        location,
        latitude,
        longitude,
        speed_kmh,
        battery_level_percent,
        recorded_at
    FROM response_team_locations
    ORDER BY team_id, recorded_at DESC
)
SELECT 
    rt.team_id,
    rt.team_code,
    rt.team_name,
    rt.team_type,
    rt.contact_phone,
    rt.current_availability,
    ltp.battery_level_percent,
    ROUND(
        (ST_Distance(ltp.location::geography, ec.location::geography) / 1000)::numeric,
        2
    ) AS distance_to_incident_km
FROM emergency_cases ec
CROSS JOIN response_teams rt
JOIN latest_team_positions ltp ON ltp.team_id = rt.team_id
WHERE ec.case_number = 'EMG-2026-0001'
  AND rt.current_availability IN ('AVAILABLE', 'STANDBY', 'DEPLOYED')
ORDER BY distance_to_incident_km ASC;

-- ----------------------------------------------------------------------------
-- District-wise Shelter Occupancy & Evacuation Readiness
-- Shows shelter availability across Karnataka districts
-- ----------------------------------------------------------------------------
SELECT 
    s.district,
    COUNT(s.shelter_id) AS total_shelters,
    SUM(sc.total_capacity) AS total_capacity,
    SUM(sc.current_occupancy) AS total_occupied,
    SUM(sc.available_capacity) AS total_available_capacity,
    ROUND((SUM(sc.current_occupancy)::numeric / NULLIF(SUM(sc.total_capacity), 0) * 100), 1) AS occupancy_percentage
FROM shelters s
JOIN shelter_capacity sc ON sc.shelter_id = s.shelter_id
WHERE s.status = 'ACTIVE'
GROUP BY s.district
ORDER BY total_available_capacity ASC;
