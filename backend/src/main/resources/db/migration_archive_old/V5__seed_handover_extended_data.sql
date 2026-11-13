-- ============================================================================
-- Migration: V5__seed_handover_extended_data.sql
-- Description: Seeds master vulnerability categories, assistance requirements,
--              meteorological event types, emergency categories, shelters,
--              hazard zones, and cross-references from the database handover.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VULNERABILITY CATEGORIES MASTER
-- ----------------------------------------------------------------------------
INSERT INTO vulnerability_categories (category_id, category_code, category_name, description, base_vulnerability_weight) VALUES
('b0000000-0000-0000-0000-000000000001', 'ELDERLY', 'Senior Citizens (60+ years)', 'Persons aged 60 and above with reduced mobility and heat sensitivity', 1.40),
('b0000000-0000-0000-0000-000000000002', 'CHILD', 'Children & Infants (< 12 years)', 'Young dependents requiring guardian supervision and nutrition', 1.25),
('b0000000-0000-0000-0000-000000000003', 'PERSON_WITH_DISABILITY', 'Persons with Physical/Sensory Disabilities', 'Individuals with mobility, visual, or hearing impairments', 1.60),
('b0000000-0000-0000-0000-000000000004', 'PREGNANT_WOMAN', 'Expectant & Lactating Mothers', 'High priority medical evacuation and hydration requirement', 1.50),
('b0000000-0000-0000-0000-000000000005', 'MEDICAL_ASSISTANCE_REQUIRED', 'Chronic Medical Condition Dependent', 'Dependent on life-support equipment, oxygen, insulin, or dialysis', 1.80)
ON CONFLICT (category_code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. ASSISTANCE REQUIREMENTS CATALOG
-- ----------------------------------------------------------------------------
INSERT INTO assistance_requirements (requirement_id, requirement_code, requirement_name, priority_level, description) VALUES
('b1000000-0000-0000-0000-000000000001', 'WHEELCHAIR_ACCESS', 'Wheelchair Ramp / Accessible Vehicle', 'STANDARD', 'Requires wheelchair accessible transport'),
('b1000000-0000-0000-0000-000000000002', 'OXYGEN_SUPPORT', 'Continuous Oxygen Concentrator / Cylinder', 'CRITICAL', 'Requires uninterrupted power and oxygen supply'),
('b1000000-0000-0000-0000-000000000003', 'DIALYSIS_DEPENDENT', 'Hemodialysis Schedule Priority', 'CRITICAL', 'Requires tri-weekly transport to clinical dialysis facility'),
('b1000000-0000-0000-0000-000000000004', 'INSULIN_REFRIGERATION', 'Cold-chain Insulin Storage', 'URGENT', 'Requires power for pharmaceutical refrigeration'),
('b1000000-0000-0000-0000-000000000005', 'STRETCHER_REQUIRED', 'Flat Stretcher Ambulance Dispatch', 'CRITICAL', 'Bed-bound individual unable to sit upright'),
('b1000000-0000-0000-0000-000000000006', 'EVACUATION_ASSISTANCE', 'Evacuation Escort Team Needed', 'URGENT', 'Cannot evacuate premises unassisted in flood/fire'),
('b1000000-0000-0000-0000-000000000007', 'HIGH_CALORIE_RATIONS', 'Special Dietary & Baby Nutritional Pack', 'STANDARD', 'Requires clean water and infant nutrition pack'),
('b1000000-0000-0000-0000-000000000008', 'PEDIATRIC_CARE', 'Pediatric First Aid Support', 'URGENT', 'Pediatric clinical monitoring required')
ON CONFLICT (requirement_code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. WEATHER EVENT TYPES MASTER
-- ----------------------------------------------------------------------------
INSERT INTO weather_event_types (event_type_id, event_code, event_name, severity_scale_description) VALUES
('b2000000-0000-0000-0000-000000000001', 'EXTREME_HEAT', 'Heatwave / Extreme Heat Warning', 'Ambient wet-bulb and dry-bulb temperatures exceeding 42C with high thermal stress index'),
('b2000000-0000-0000-0000-000000000002', 'HEAVY_RAINFALL', 'Very Heavy to Extremely Heavy Downpour', '24-hour localized precipitation between 115.6mm and 204.4mm leading to rapid runoff'),
('b2000000-0000-0000-0000-000000000003', 'FLOOD', 'Riverine & Urban Flash Flood Inundation', 'Water body overflow resulting in low-lying land submergence and structural threats'),
('b2000000-0000-0000-0000-000000000004', 'CYCLONE', 'Tropical Cyclonic Storm', 'Sustained cyclonic wind velocity exceeding 65 knots accompanied by storm surges'),
('b2000000-0000-0000-0000-000000000005', 'SEVERE_STORM', 'Thunderstorm, High Wind & Hail Hazard', 'High velocity squall winds (>50 km/h) accompanied by frequent lightning and localized hail')
ON CONFLICT (event_code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. EMERGENCY CATEGORIES MASTER
-- ----------------------------------------------------------------------------
INSERT INTO emergency_categories (category_id, category_code, category_name, priority_weight) VALUES
('b3000000-0000-0000-0000-000000000001', 'MEDICAL_ASSISTANCE', 'Urgent Medical Assistance & Equipment Failure', 3),
('b3000000-0000-0000-0000-000000000002', 'EVACUATION', 'Pre-emptive Evacuation Request', 2),
('b3000000-0000-0000-0000-000000000003', 'RESCUE', 'Active Flood/Structural Trapping Rescue', 3),
('b3000000-0000-0000-0000-000000000004', 'FOOD_AND_WATER', 'Clean Drinking Water & Critical Rations', 1),
('b3000000-0000-0000-0000-000000000005', 'TRANSPORTATION', 'Specialized Medical & Wheelchair Transport', 2),
('b3000000-0000-0000-0000-000000000006', 'OTHER', 'General Community Distress Assistance', 1)
ON CONFLICT (category_code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. EMERGENCY SHELTERS & CAPACITIES
-- ----------------------------------------------------------------------------
INSERT INTO shelters (
    shelter_id, shelter_code, shelter_name, shelter_type,
    district, taluk, address, location, latitude, longitude,
    contact_person_name, contact_phone, is_accessible_disabled, has_medical_facility, has_backup_power, status
) VALUES
(
    'c0000000-0000-0000-0000-000000000001', 'SHL-KODAGU-01', 'Madikeri Government Junior College Relief Camp', 'SCHOOL',
    'Kodagu', 'Madikeri', 'College Road, Near Raja Seat, Madikeri',
    ST_SetSRID(ST_MakePoint(75.7382, 12.4244), 4326), 12.42440000, 75.73820000,
    'Smt. Kavita Patil (Principal)', '+91-9448000001', TRUE, TRUE, TRUE, 'ACTIVE'
),
(
    'c0000000-0000-0000-0000-000000000002', 'SHL-KALAB-01', 'Kalaburagi APMC Community Relief Hall', 'COMMUNITY_HALL',
    'Kalaburagi', 'Kalaburagi', 'APMC Yard, Nehru Gunj, Kalaburagi',
    ST_SetSRID(ST_MakePoint(76.8343, 17.3297), 4326), 17.32970000, 76.83430000,
    'Sri. Basavarajappa (Secretary)', '+91-9448000002', TRUE, FALSE, TRUE, 'ACTIVE'
),
(
    'c0000000-0000-0000-0000-000000000003', 'SHL-UDUPI-01', 'Malpe Coastal Evacuation Cyclone Shelter', 'TEMPORARY_CAMP',
    'Udupi', 'Udupi', 'Near Malpe Harbor Gate 2, Malpe Coast',
    ST_SetSRID(ST_MakePoint(74.7023, 13.3498), 4326), 13.34980000, 74.70230000,
    'Sri. Prabhakar Kundar', '+91-9448000003', TRUE, TRUE, TRUE, 'ACTIVE'
),
(
    'c0000000-0000-0000-0000-000000000004', 'SHL-BLR-01', 'Yelahanka Mini Stadium Relief Facility', 'STADIUM',
    'Bengaluru Urban', 'Bengaluru North', 'BBMP Sports Complex, Kogilu Main Rd, Yelahanka',
    ST_SetSRID(ST_MakePoint(77.5963, 13.1007), 4326), 13.10070000, 77.59630000,
    'Sri. Muniswamy (BBMP AEE)', '+91-9448000004', TRUE, TRUE, TRUE, 'ACTIVE'
)
ON CONFLICT (shelter_code) DO NOTHING;

INSERT INTO shelter_capacity (capacity_id, shelter_id, total_capacity, current_occupancy, special_care_capacity, special_care_occupancy) VALUES
('c1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 350, 42, 35, 8),
('c1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 600, 115, 60, 12),
('c1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 450, 0, 45, 0),
('c1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 800, 85, 80, 14)
ON CONFLICT (shelter_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. DYNAMIC HAZARD DANGER ZONES
-- ----------------------------------------------------------------------------
INSERT INTO affected_zones (
    zone_id, zone_name, hazard_type, severity_level, boundary, is_active, effective_from, effective_to
) VALUES
(
    'c2000000-0000-0000-0000-000000000001',
    'Cauvery River Bhagamandala Inundation Basin',
    'FLOOD_INUNDATION',
    'HIGH',
    ST_SetSRID(ST_GeomFromText('POLYGON((75.5200 12.3800, 75.5600 12.3800, 75.5600 12.4200, 75.5200 12.4200, 75.5200 12.3800))'), 4326),
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP + INTERVAL '3 days'
),
(
    'c2000000-0000-0000-0000-000000000002',
    'Malpe Coastline High Storm Surge Corridor',
    'CYCLONE_PATH',
    'CRITICAL',
    ST_SetSRID(ST_GeomFromText('POLYGON((74.6800 13.3300, 74.7200 13.3300, 74.7200 13.3700, 74.6800 13.3700, 74.6800 13.3300))'), 4326),
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '6 hours',
    CURRENT_TIMESTAMP + INTERVAL '2 days'
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. BACKFILL USER ROLES JUNCTION FROM EXISTING USERS
-- ----------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
CROSS JOIN roles r
WHERE (u.role = 'ROLE_ADMIN' AND (r.name = 'ROLE_ADMIN' OR r.name = 'ADMIN'))
   OR (u.role = 'ROLE_AUTHORITY' AND (r.name = 'ROLE_AUTHORITY' OR r.name = 'AUTHORITY'))
   OR (u.role = 'ROLE_CAREGIVER' AND (r.name = 'ROLE_CAREGIVER' OR r.name = 'CAREGIVER'))
   OR (u.role = 'ROLE_CITIZEN' AND (r.name = 'ROLE_CITIZEN' OR r.name = 'CITIZEN'))
   OR (u.role = 'ROLE_VOLUNTEER' AND (r.name = 'ROLE_VOLUNTEER' OR r.name = 'VOLUNTEER'))
ON CONFLICT DO NOTHING;
