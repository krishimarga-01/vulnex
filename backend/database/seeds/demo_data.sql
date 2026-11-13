-- ============================================================================
-- Seed File: demo_data.sql
-- Description: Demonstration dataset for Extreme Weather Vulnerability & Emergency Response
-- NOTE: ALL DATA GENERATED IS DEMONSTRATION DATA ONLY. ALL NAMES, TELEPHONES,
-- AND IDENTIFIERS ARE FICTIONAL AND SYNTHETIC FOR TESTING PURPOSES.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ROLES
-- ----------------------------------------------------------------------------
INSERT INTO roles (role_id, role_name, description) VALUES
('a0000000-0000-0000-0000-000000000001', 'CITIZEN', 'General public user seeking guidance or submitting requests'),
('a0000000-0000-0000-0000-000000000002', 'CAREGIVER', 'Registered primary caregiver managing vulnerable family members'),
('a0000000-0000-0000-0000-000000000003', 'VOLUNTEER', 'Certified community emergency volunteer providing field aid'),
('a0000000-0000-0000-0000-000000000004', 'AUTHORITY', 'District disaster management officer / triage controller'),
('a0000000-0000-0000-0000-000000000005', 'ADMIN', 'System administrator with overall configuration access')
ON CONFLICT (role_name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. USERS (20 Sample Demonstration Users)
-- Realistic password hash: BCrypt of "DemonstrationPass@2026!"
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, full_name, email, phone_number, password_hash, account_status) VALUES
-- Authorities & Admins (1-4)
('10000000-0000-0000-0000-000000000001', 'Ramesh Kumar IAS', 'ramesh.kumar@demo-karnataka.gov.in', '+91-9800000001', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000002', 'Dr. Sunita Deshmukh', 'sunita.deshmukh@demo-sdma.gov.in', '+91-9800000002', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000003', 'Commander Vijay Nayak', 'vijay.nayak@demo-ndrf.gov.in', '+91-9800000003', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000004', 'Ananya Sharma Admin', 'ananya.sysadmin@demo-emergency.org', '+91-9800000004', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),

-- Caregivers (5-9)
('10000000-0000-0000-0000-000000000005', 'Girish Gowda', 'girish.gowda@demo-mail.in', '+91-9800000005', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000006', 'Meenakshi Patil', 'meenakshi.patil@demo-mail.in', '+91-9800000006', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000007', 'Abdul Farooq', 'abdul.farooq@demo-mail.in', '+91-9800000007', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000008', 'Roopa Hegde', 'roopa.hegde@demo-mail.in', '+91-9800000008', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000009', 'Karthik Somanna', 'karthik.somanna@demo-mail.in', '+91-9800000009', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),

-- Volunteers (10-14)
('10000000-0000-0000-0000-000000000010', 'Pradeep Kulkarni', 'pradeep.volunteer@demo-aid.org', '+91-9800000010', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000011', 'Laxmi B', 'laxmi.b@demo-aid.org', '+91-9800000011', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000012', 'Sandeep Rao', 'sandeep.rao@demo-aid.org', '+91-9800000012', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000013', 'Deepak Shetty', 'deepak.shetty@demo-aid.org', '+91-9800000013', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000014', 'Naveen Madappa', 'naveen.madappa@demo-aid.org', '+91-9800000014', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),

-- Citizens (15-20)
('10000000-0000-0000-0000-000000000015', 'Mallikarjun Bidar', 'mallik.bidar@demo-mail.in', '+91-9800000015', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000016', 'Shantamma Hiremath', 'shantamma.h@demo-mail.in', '+91-9800000016', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000017', 'Bhaskar Poojary', 'bhaskar.poojary@demo-mail.in', '+91-9800000017', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000018', 'Shruti Muthappa', 'shruti.m@demo-mail.in', '+91-9800000018', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000019', 'Zameer Ahmed', 'zameer.ahmed@demo-mail.in', '+91-9800000019', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE'),
('10000000-0000-0000-0000-000000000020', 'Vidya Acharya', 'vidya.acharya@demo-mail.in', '+91-9800000020', '$2a$12$e6mZzI7qg8q2J2hT8pP5uO1Kk7hZ9lM3qY4vP5wR6tY7uI8oP9sQa', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Assign User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004'), -- Authority
('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'), -- Authority
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004'), -- Authority
('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005'), -- Admin
('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002'), -- Caregiver
('10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002'), -- Caregiver
('10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002'), -- Caregiver
('10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002'), -- Caregiver
('10000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002'), -- Caregiver
('10000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003'), -- Volunteer
('10000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003'), -- Volunteer
('10000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000003'), -- Volunteer
('10000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000003'), -- Volunteer
('10000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000003'), -- Volunteer
('10000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001'), -- Citizen
('10000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001'), -- Citizen
('10000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001'), -- Citizen
('10000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001'), -- Citizen
('10000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001'), -- Citizen
('10000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001')  -- Citizen
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. VULNERABILITY CATEGORIES & ASSISTANCE REQUIREMENTS
-- ----------------------------------------------------------------------------
INSERT INTO vulnerability_categories (category_id, category_code, category_name, description, base_vulnerability_weight) VALUES
('b0000000-0000-0000-0000-000000000001', 'ELDERLY', 'Senior Citizens (60+ years)', 'Persons aged 60 and above with reduced mobility and heat sensitivity', 1.40),
('b0000000-0000-0000-0000-000000000002', 'CHILD', 'Children & Infants (< 12 years)', 'Young dependents requiring guardian supervision and nutrition', 1.25),
('b0000000-0000-0000-0000-000000000003', 'PERSON_WITH_DISABILITY', 'Persons with Physical/Sensory Disabilities', 'Individuals with mobility, visual, or hearing impairments', 1.60),
('b0000000-0000-0000-0000-000000000004', 'PREGNANT_WOMAN', 'Expectant & Lactating Mothers', 'High priority medical evacuation and hydration requirement', 1.50),
('b0000000-0000-0000-0000-000000000005', 'MEDICAL_ASSISTANCE_REQUIRED', 'Chronic Medical Condition Dependent', 'Dependent on life-support equipment, oxygen, insulin, or dialysis', 1.80)
ON CONFLICT (category_code) DO NOTHING;

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
-- 4. GEOGRAPHICAL REGIONS (5 Karnataka Regions with Polygons & Centroids)
-- ----------------------------------------------------------------------------
INSERT INTO geographical_regions (
    region_id, region_code, region_name, state, district, taluk, village_or_locality,
    boundary, centroid, latitude, longitude, region_risk_level, elevation_meters
) VALUES
-- Region 1: Bengaluru Urban
('c0000000-0000-0000-0000-000000000001', 'KA-BLR-01', 'Bengaluru Urban Central', 'Karnataka', 'Bengaluru Urban', 'Bengaluru North', 'Shivajinagar',
 ST_Multi(ST_GeomFromText('POLYGON((77.580 12.960, 77.620 12.960, 77.620 13.000, 77.580 13.000, 77.580 12.960))', 4326)),
 ST_GeomFromText('POINT(77.5946 12.9716)', 4326), 12.9716, 77.5946, 'MEDIUM', 920.00),

-- Region 2: Uttara Kannada (Coastal Flood / Cyclone risk)
('c0000000-0000-0000-0000-000000000002', 'KA-UK-02', 'Karwar Coastal Zone', 'Karnataka', 'Uttara Kannada', 'Karwar', 'Baithkol Harbor',
 ST_Multi(ST_GeomFromText('POLYGON((74.100 14.800, 74.160 14.800, 74.160 14.850, 74.100 14.850, 74.100 14.800))', 4326)),
 ST_GeomFromText('POINT(74.1303 14.8185)', 4326), 14.8185, 74.1303, 'HIGH', 12.00),

-- Region 3: Kalaburagi / Gulbarga (Extreme Heatwave corridor)
('c0000000-0000-0000-0000-000000000003', 'KA-KLB-03', 'Kalaburagi Plains', 'Karnataka', 'Kalaburagi', 'Kalaburagi', 'Maktampura',
 ST_Multi(ST_GeomFromText('POLYGON((76.800 17.300, 76.860 17.300, 76.860 17.360, 76.800 17.360, 76.800 17.300))', 4326)),
 ST_GeomFromText('POINT(76.8343 17.3297)', 4326), 17.3297, 76.8343, 'HIGH', 454.00),

-- Region 4: Kodagu / Coorg (Western Ghats Landslide / Heavy Rain)
('c0000000-0000-0000-0000-000000000004', 'KA-KDG-04', 'Madikeri Hills Basin', 'Karnataka', 'Kodagu', 'Madikeri', 'Bhagamandala',
 ST_Multi(ST_GeomFromText('POLYGON((75.700 12.400, 75.760 12.400, 75.760 12.460, 75.700 12.460, 75.700 12.400))', 4326)),
 ST_GeomFromText('POINT(75.7382 12.4244)', 4326), 12.4244, 75.7382, 'SEVERE', 1150.00),

-- Region 5: Udupi (Coastal Inundation / Heavy Monsoon)
('c0000000-0000-0000-0000-000000000005', 'KA-UDP-05', 'Udupi Coastal Belt', 'Karnataka', 'Udupi', 'Udupi', 'Malpe Port',
 ST_Multi(ST_GeomFromText('POLYGON((74.710 13.310, 74.770 13.310, 74.770 13.370, 74.710 13.370, 74.710 13.310))', 4326)),
 ST_GeomFromText('POINT(74.7421 13.3409)', 4326), 13.3409, 74.7421, 'HIGH', 15.00)
ON CONFLICT (region_code) DO NOTHING;

-- Dynamic Affected Zones (Inundation / Heat corridors)
INSERT INTO affected_zones (
    zone_id, zone_name, hazard_type, severity_level, boundary, is_active,
    effective_from, effective_to, created_by_user_id
) VALUES
('c1000000-0000-0000-0000-000000000001', 'Bhagamandala Flash Flood Basin', 'FLOOD_INUNDATION', 'CRITICAL',
 ST_GeomFromText('POLYGON((75.710 12.410, 75.750 12.410, 75.750 12.450, 75.710 12.450, 75.710 12.410))', 4326),
 TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '3 days', '10000000-0000-0000-0000-000000000001'),

('c1000000-0000-0000-0000-000000000002', 'Kalaburagi Urban Heat Corridor', 'HEATWAVE_CORRIDOR', 'HIGH',
 ST_GeomFromText('POLYGON((76.810 17.310, 76.850 17.310, 76.850 17.350, 76.810 17.350, 76.810 17.310))', 4326),
 TRUE, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days', '10000000-0000-0000-0000-000000000002'),

('c1000000-0000-0000-0000-000000000003', 'Karwar Estuary Tidal Surge Zone', 'CYCLONE_PATH', 'CRITICAL',
 ST_GeomFromText('POLYGON((74.110 14.810, 74.150 14.810, 74.150 14.840, 74.110 14.840, 74.110 14.810))', 4326),
 TRUE, CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP + INTERVAL '24 hours', '10000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. SHELTERS & SHELTER CAPACITY
-- ----------------------------------------------------------------------------
INSERT INTO shelters (
    shelter_id, shelter_code, shelter_name, shelter_type, district, taluk, address,
    location, latitude, longitude, contact_person_name, contact_phone,
    is_accessible_disabled, has_medical_facility, has_backup_power, status
) VALUES
('30000000-0000-0000-0000-000000000001', 'SHL-BLR-01', 'Kanteerava Stadium Indoor Relief Center', 'STADIUM', 'Bengaluru Urban', 'Bengaluru North', 'Kasturba Road, Sampangi Rama Nagara',
 ST_GeomFromText('POINT(77.5928 12.9698)', 4326), 12.9698, 77.5928, 'Suresh Gowda', '+91-9800000031', TRUE, TRUE, TRUE, 'ACTIVE'),

('30000000-0000-0000-0000-000000000002', 'SHL-UK-02', 'Karwar Government Model High School', 'SCHOOL', 'Uttara Kannada', 'Karwar', 'Near Kodibag Beach Road',
 ST_GeomFromText('POINT(74.1350 14.8210)', 4326), 14.8210, 74.1350, 'Manjunath Naik', '+91-9800000032', TRUE, TRUE, TRUE, 'ACTIVE'),

('30000000-0000-0000-0000-000000000003', 'SHL-KLB-03', 'Gulbarga University Community Hall', 'COMMUNITY_HALL', 'Kalaburagi', 'Kalaburagi', 'Jnana Ganga Campus, Sedam Road',
 ST_GeomFromText('POINT(76.8390 17.3310)', 4326), 17.3310, 76.8390, 'Dr. Basavaraj', '+91-9800000033', TRUE, TRUE, TRUE, 'ACTIVE'),

('30000000-0000-0000-0000-000000000004', 'SHL-KDG-04', 'Madikeri General Hospital Evacuation Wing', 'HOSPITAL', 'Kodagu', 'Madikeri', 'College Road, Madikeri',
 ST_GeomFromText('POINT(75.7390 12.4260)', 4326), 12.4260, 75.7390, 'Sister Mary Thomas', '+91-9800000034', TRUE, TRUE, TRUE, 'ACTIVE'),

('30000000-0000-0000-0000-000000000005', 'SHL-UDP-05', 'Malpe Fishermen Community Complex', 'COMMUNITY_HALL', 'Udupi', 'Udupi', 'Port Road, Malpe',
 ST_GeomFromText('POINT(74.7450 13.3420)', 4326), 13.3420, 74.7450, 'Ganesh Salian', '+91-9800000035', FALSE, FALSE, TRUE, 'ACTIVE')
ON CONFLICT (shelter_code) DO NOTHING;

INSERT INTO shelter_capacity (capacity_id, shelter_id, total_capacity, current_occupancy, special_care_capacity, special_care_occupancy, updated_by_user_id) VALUES
('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1200, 350, 150, 42, '10000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 400, 280, 50, 35, '10000000-0000-0000-0000-000000000002'),
('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 600, 120, 80, 15, '10000000-0000-0000-0000-000000000001'),
('31000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 250, 190, 120, 95, '10000000-0000-0000-0000-000000000002'),
('31000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 500, 420, 40, 38, '10000000-0000-0000-0000-000000000003')
ON CONFLICT (shelter_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. VULNERABLE PERSONS (30 Realistic Demonstration Records)
-- Distributed across Karnataka regions, with categories, ages, coordinates
-- ----------------------------------------------------------------------------
INSERT INTO vulnerable_persons (
    person_id, registered_by_user_id, full_name, date_of_birth, age, age_category,
    gender, primary_phone, address_line, village_or_locality, taluk, district, state,
    postal_code, primary_category_id, geographical_region_id, location, latitude, longitude,
    verification_status, verified_by_user_id, verified_at, consent_status, is_active
) VALUES
-- Bengaluru Urban (Persons 1 - 6)
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Kaveramma Byrappa', '1948-03-12', 78, 'SENIOR_CITIZEN', 'FEMALE', '+91-9800000101', '#12 3rd Cross, Malleshwaram', 'Malleshwaram', 'Bengaluru North', 'Bengaluru Urban', 'Karnataka', '560003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', ST_GeomFromText('POINT(77.5850 12.9720)', 4326), 12.9720, 77.5850, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Master Aarav Gowda', '2023-08-15', 3, 'INFANT', 'MALE', '+91-9800000102', '#44 Basavanagudi Main Road', 'Basavanagudi', 'Bengaluru South', 'Bengaluru Urban', 'Karnataka', '560004', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', ST_GeomFromText('POINT(77.5890 12.9680)', 4326), 12.9680, 77.5890, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000010', 'Chandrashekar Murthy', '1985-05-20', 41, 'ADULT', 'MALE', '+91-9800000103', 'Flat 201 Lakeview Apts, Ulsoor', 'Ulsoor', 'Bengaluru East', 'Bengaluru Urban', 'Karnataka', '560008', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', ST_GeomFromText('POINT(77.6100 12.9780)', 4326), 12.9780, 77.6100, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000015', 'Divya Nandeesh', '1996-11-04', 30, 'ADULT', 'FEMALE', '+91-9800000104', '#88 Rajajinagar 1st Block', 'Rajajinagar', 'Bengaluru North', 'Bengaluru Urban', 'Karnataka', '560010', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', ST_GeomFromText('POINT(77.5820 12.9850)', 4326), 12.9850, 77.5820, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Narayanappa Reddy', '1942-01-28', 84, 'SENIOR_CITIZEN', 'MALE', '+91-9800000105', '#22 Domlur Village', 'Domlur', 'Bengaluru East', 'Bengaluru Urban', 'Karnataka', '560071', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', ST_GeomFromText('POINT(77.6150 12.9640)', 4326), 12.9640, 77.6150, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000010', 'Kumari Ananya Rao', '2018-09-19', 8, 'CHILD', 'FEMALE', '+91-9800000106', '#9 Seshadripuram Main', 'Seshadripuram', 'Bengaluru North', 'Bengaluru Urban', 'Karnataka', '560020', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', ST_GeomFromText('POINT(77.5870 12.9890)', 4326), 12.9890, 77.5870, 'UNVERIFIED', NULL, NULL, 'GIVEN', TRUE),

-- Uttara Kannada / Karwar (Persons 7 - 12)
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000008', 'Dattatreya Harikantra', '1951-04-10', 75, 'SENIOR_CITIZEN', 'MALE', '+91-9800000107', 'Fisheries Colony, Baithkol', 'Baithkol', 'Karwar', 'Uttara Kannada', 'Karnataka', '581302', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', ST_GeomFromText('POINT(74.1280 14.8150)', 4326), 14.8150, 74.1280, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Parvati Naik', '1960-07-22', 66, 'SENIOR_CITIZEN', 'FEMALE', '+91-9800000108', 'Near Kali River Bridge, Kodibag', 'Kodibag', 'Karwar', 'Uttara Kannada', 'Karnataka', '581303', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', ST_GeomFromText('POINT(74.1320 14.8320)', 4326), 14.8320, 74.1320, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000013', 'Vinayak Gaonkar', '1992-03-14', 34, 'ADULT', 'MALE', '+91-9800000109', 'Near Aligadda Beach Road', 'Aligadda', 'Karwar', 'Uttara Kannada', 'Karnataka', '581304', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', ST_GeomFromText('POINT(74.1410 14.8190)', 4326), 14.8190, 74.1410, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000017', 'Deepa Tandel', '2000-02-18', 26, 'ADULT', 'FEMALE', '+91-9800000110', 'Sea View Quarters, Binaga', 'Binaga', 'Karwar', 'Uttara Kannada', 'Karnataka', '581307', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', ST_GeomFromText('POINT(74.1480 14.8080)', 4326), 14.8080, 74.1480, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000013', 'Master Chethan Naik', '2021-05-11', 5, 'CHILD', 'MALE', '+91-9800000111', 'Old Post Office Lane, Karwar', 'Karwar City', 'Karwar', 'Uttara Kannada', 'Karnataka', '581301', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', ST_GeomFromText('POINT(74.1330 14.8210)', 4326), 14.8210, 74.1330, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000008', 'Kusuma Harikantra', '1945-12-01', 80, 'SENIOR_CITIZEN', 'FEMALE', '+91-9800000112', 'Near Lighthouse, Karwar', 'Baithkol', 'Karwar', 'Uttara Kannada', 'Karnataka', '581302', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', ST_GeomFromText('POINT(74.1250 14.8110)', 4326), 14.8110, 74.1250, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),

-- Kalaburagi / Heatwave Zone (Persons 13 - 18)
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000006', 'Sharanappa Patil', '1940-06-15', 86, 'SENIOR_CITIZEN', 'MALE', '+91-9800000113', 'Old Jewargi Road, Kalaburagi', 'Brahmpur', 'Kalaburagi', 'Kalaburagi', 'Karnataka', '585102', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', ST_GeomFromText('POINT(76.8290 17.3250)', 4326), 17.3250, 76.8290, 'VERIFIED', '10000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000006', 'Mahadevi Patil', '1947-09-08', 79, 'SENIOR_CITIZEN', 'FEMALE', '+91-9800000114', 'Near Sharanabasaveshwara Temple', 'Brahmpur', 'Kalaburagi', 'Kalaburagi', 'Karnataka', '585103', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', ST_GeomFromText('POINT(76.8320 17.3340)', 4326), 17.3340, 76.8320, 'VERIFIED', '10000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000007', 'Syed Khaleel', '1978-10-30', 48, 'ADULT', 'MALE', '+91-9800000115', 'Maktampura Gali No 4', 'Maktampura', 'Kalaburagi', 'Kalaburagi', 'Karnataka', '585101', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', ST_GeomFromText('POINT(76.8410 17.3280)', 4326), 17.3280, 76.8410, 'VERIFIED', '10000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000007', 'Fatima Begum', '1998-04-12', 28, 'ADULT', 'FEMALE', '+91-9800000116', 'Chowk Muslim Galli', 'Chowk Area', 'Kalaburagi', 'Kalaburagi', 'Karnataka', '585104', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', ST_GeomFromText('POINT(76.8370 17.3220)', 4326), 17.3220, 76.8370, 'VERIFIED', '10000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000011', 'Baby Zoya Farooq', '2024-01-20', 2, 'INFANT', 'FEMALE', '+91-9800000117', 'Maktampura Ring Road', 'Maktampura', 'Kalaburagi', 'Kalaburagi', 'Karnataka', '585101', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', ST_GeomFromText('POINT(76.8450 17.3310)', 4326), 17.3310, 76.8450, 'VERIFIED', '10000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000016', 'Basappa Rathod', '1955-08-14', 71, 'SENIOR_CITIZEN', 'MALE', '+91-9800000118', 'Aland Checkpost Thanda', 'Aland Road', 'Kalaburagi', 'Kalaburagi', 'Karnataka', '585103', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', ST_GeomFromText('POINT(76.8220 17.3450)', 4326), 17.3450, 76.8220, 'VERIFIED', '10000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, 'GIVEN', TRUE),

-- Kodagu / Coorg (Persons 19 - 24)
('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000009', 'Appanna Bopanna', '1944-05-18', 82, 'SENIOR_CITIZEN', 'MALE', '+91-9800000119', 'Riverbank Estate, Bhagamandala', 'Bhagamandala', 'Madikeri', 'Kodagu', 'Karnataka', '571247', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', ST_GeomFromText('POINT(75.7250 12.4180)', 4326), 12.4180, 75.7250, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000009', 'Kaveri Muthappa', '1995-12-10', 31, 'ADULT', 'FEMALE', '+91-9800000120', 'Coffee Planters Lane, Madikeri', 'Stuart Hill', 'Madikeri', 'Kodagu', 'Karnataka', '571201', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', ST_GeomFromText('POINT(75.7350 12.4280)', 4326), 12.4280, 75.7350, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000014', 'Thimmaiah Madappa', '1988-03-25', 38, 'ADULT', 'MALE', '+91-9800000121', 'Kalyan Nagar, Madikeri', 'Madikeri Rural', 'Madikeri', 'Kodagu', 'Karnataka', '571201', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', ST_GeomFromText('POINT(75.7420 12.4310)', 4326), 12.4310, 75.7420, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000018', 'Subbamma Devaiah', '1950-02-14', 76, 'SENIOR_CITIZEN', 'FEMALE', '+91-9800000122', 'Hill Crest Cottage, Raja Seat Road', 'Raja Seat', 'Madikeri', 'Kodagu', 'Karnataka', '571201', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', ST_GeomFromText('POINT(75.7330 12.4210)', 4326), 12.4210, 75.7330, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000014', 'Baby Prema Somanna', '2023-04-05', 3, 'INFANT', 'FEMALE', '+91-9800000123', 'Valley View Settlement', 'Bhagamandala', 'Madikeri', 'Kodagu', 'Karnataka', '571247', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', ST_GeomFromText('POINT(75.7280 12.4150)', 4326), 12.4150, 75.7280, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000009', 'Ganesh Machaiah', '1962-11-29', 64, 'SENIOR_CITIZEN', 'MALE', '+91-9800000124', 'Talacauvery Road, Bhagamandala', 'Bhagamandala', 'Madikeri', 'Kodagu', 'Karnataka', '571247', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', ST_GeomFromText('POINT(75.7210 12.4120)', 4326), 12.4120, 75.7210, 'VERIFIED', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'GIVEN', TRUE),

-- Udupi Coastal (Persons 25 - 30)
('20000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000012', 'Sheena Marakala', '1949-08-20', 77, 'SENIOR_CITIZEN', 'MALE', '+91-9800000125', 'Malpe Beach Fishermen Colony', 'Malpe', 'Udupi', 'Udupi', 'Karnataka', '576108', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', ST_GeomFromText('POINT(74.7380 13.3390)', 4326), 13.3390, 74.7380, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000017', 'Vasanthi Poojarthi', '1958-03-15', 68, 'SENIOR_CITIZEN', 'FEMALE', '+91-9800000126', 'Near Udupi Krishna Mutt Road', 'Car Street', 'Udupi', 'Udupi', 'Karnataka', '576101', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', ST_GeomFromText('POINT(74.7520 13.3410)', 4326), 13.3410, 74.7520, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000012', 'Praveen Mendon', '1990-10-10', 36, 'ADULT', 'MALE', '+91-9800000127', 'Bengre Hoode Estuary House', 'Hoode', 'Udupi', 'Udupi', 'Karnataka', '576115', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', ST_GeomFromText('POINT(74.7320 13.3550)', 4326), 13.3550, 74.7320, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000020', 'Rashmi Acharya', '1997-06-02', 29, 'ADULT', 'FEMALE', '+91-9800000128', 'Kunjibettu 2nd Cross', 'Kunjibettu', 'Udupi', 'Udupi', 'Karnataka', '576102', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', ST_GeomFromText('POINT(74.7480 13.3480)', 4326), 13.3480, 74.7480, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000012', 'Master Nihal Suvarna', '2019-12-14', 7, 'CHILD', 'MALE', '+91-9800000129', 'Padukere Beach Hamlet', 'Padukere', 'Udupi', 'Udupi', 'Karnataka', '576118', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', ST_GeomFromText('POINT(74.7360 13.3280)', 4326), 13.3280, 74.7360, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE),
('20000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000020', 'Saraswathi Bhat', '1938-04-25', 88, 'SENIOR_CITIZEN', 'FEMALE', '+91-9800000130', 'Bailoor Temple Road', 'Bailoor', 'Udupi', 'Udupi', 'Karnataka', '576101', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', ST_GeomFromText('POINT(74.7550 13.3360)', 4326), 13.3360, 74.7550, 'VERIFIED', '10000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, 'GIVEN', TRUE)
ON CONFLICT (person_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. CAREGIVER RELATIONSHIPS & ASSISTANCE REQUIREMENTS MAPPINGS
-- ----------------------------------------------------------------------------
INSERT INTO caregiver_relationships (relationship_id, caregiver_user_id, person_id, relationship_type, is_primary) VALUES
('21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'CHILD', TRUE),
('21000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'PARENT', TRUE),
('21000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000007', 'CHILD', TRUE),
('21000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000013', 'CHILD', TRUE),
('21000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000015', 'SIBLING', TRUE),
('21000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000019', 'CHILD', TRUE)
ON CONFLICT (caregiver_user_id, person_id) DO NOTHING;

-- Multiple Assistance Requirements for vulnerable persons
INSERT INTO person_assistance_requirements (person_id, requirement_id, notes, is_critical) VALUES
('20000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Requires walking walker / wheelchair ramp', FALSE),
('20000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'High-flow oxygen concentrator dependency', TRUE),
('20000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'Bed-bound cardiac patient, stretcher essential', TRUE),
('20000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'Dialysis scheduled Monday, Wednesday, Friday', TRUE),
('20000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000004', 'Daily insulin requiring active refrigeration', FALSE),
('20000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000002', 'Portable oxygen cylinder required during evacuation', TRUE),
('20000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000006', 'High flood prone riverbank zone; emergency escort', TRUE),
('20000000-0000-0000-0000-000000000024', 'b1000000-0000-0000-0000-000000000003', 'Hemodialysis dependent', TRUE),
('20000000-0000-0000-0000-000000000026', 'b1000000-0000-0000-0000-000000000004', 'Insulin cold storage', FALSE)
ON CONFLICT (person_id, requirement_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. RESPONSE TEAMS (3 Response Teams in Karnataka)
-- ----------------------------------------------------------------------------
INSERT INTO response_teams (team_id, team_code, team_name, team_type, contact_phone, contact_email, base_region_id, current_availability) VALUES
('40000000-0000-0000-0000-000000000001', 'TM-NDRF-10', '10th Battalion NDRF Quick Response Team', 'NDRF', '+91-9800000051', 'ndrf.10bn@demo-disaster.gov.in', 'c0000000-0000-0000-0000-000000000001', 'AVAILABLE'),
('40000000-0000-0000-0000-000000000002', 'TM-SDRF-UK', 'SDRF Coastal Marine Rescue Unit Karwar', 'SDRF', '+91-9800000052', 'sdrf.karwar@demo-police.gov.in', 'c0000000-0000-0000-0000-000000000002', 'DEPLOYED'),
('40000000-0000-0000-0000-000000000003', 'TM-MED-KDG', 'Western Ghats Rapid Medical Relief Corps', 'MEDICAL_CORPS', '+91-9800000053', 'rapidmed.kodagu@demo-health.gov.in', 'c0000000-0000-0000-0000-000000000004', 'DEPLOYED')
ON CONFLICT (team_code) DO NOTHING;

-- Assign Team Members
INSERT INTO response_team_members (member_id, team_id, user_id, member_role) VALUES
('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'TEAM_LEADER'),
('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000013', 'RESCUE_SPECIALIST'),
('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000014', 'PARAMEDIC')
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Telemetry GPS locations for Teams
INSERT INTO response_team_locations (location_id, team_id, location, latitude, longitude, speed_kmh, battery_level_percent) VALUES
('42000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', ST_GeomFromText('POINT(77.5940 12.9710)', 4326), 12.9710, 77.5940, 0.0, 98),
('42000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', ST_GeomFromText('POINT(74.1310 14.8190)', 4326), 14.8190, 74.1310, 24.5, 84),
('42000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', ST_GeomFromText('POINT(75.7270 12.4170)', 4326), 12.4170, 75.7270, 18.2, 79)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. WEATHER OBSERVATIONS & WEATHER ALERTS
-- ----------------------------------------------------------------------------
INSERT INTO weather_event_types (event_type_id, event_code, event_name, severity_scale_description) VALUES
('d0000000-0000-0000-0000-000000000001', 'EXTREME_HEAT', 'Heatwave / Severe Heatwave', 'Day temps > 44C or 5C above normal'),
('d0000000-0000-0000-0000-000000000002', 'HEAVY_RAINFALL', 'Very Heavy to Extremely Heavy Rainfall', 'Rainfall between 115.6mm and 204.4mm in 24h'),
('d0000000-0000-0000-0000-000000000003', 'FLOOD', 'Riverine Flash Flood & Inundation', 'River gauge crossing danger mark'),
('d0000000-0000-0000-0000-000000000004', 'CYCLONE', 'Cyclonic Storm / Severe Cyclonic Storm', 'Sustained coastal winds >= 65 knots'),
('d0000000-0000-0000-0000-000000000005', 'SEVERE_STORM', 'Thunderstorm with Gusty Winds & Lightning', 'Wind gusts > 70 km/h with high frequency lightning')
ON CONFLICT (event_code) DO NOTHING;

-- Telemetry Weather Observations
INSERT INTO weather_observations (
    observation_id, region_id, weather_provider, source_station_id,
    temperature_celsius, relative_humidity_percent, rainfall_mm, wind_speed_kmh,
    wind_gust_kmh, atmospheric_pressure_hpa, heat_index_celsius, observation_timestamp
) VALUES
('d1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'IMD_BENGALURU', 'STN-BLR-01', 34.2, 62.0, 15.4, 18.0, 32.0, 1012.0, 39.5, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('d1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'IMD_KARWAR', 'STN-UK-02', 30.8, 92.0, 185.0, 68.0, 95.0, 998.5, 42.0, CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('d1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'IMD_KALABURAGI', 'STN-KLB-03', 44.8, 22.0, 0.0, 14.0, 22.0, 1008.0, 48.2, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
('d1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'IMD_MADIKERI', 'STN-KDG-04', 21.5, 98.0, 245.0, 45.0, 72.0, 989.0, 22.0, CURRENT_TIMESTAMP - INTERVAL '20 minutes'),
('d1000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'IMD_PANAMBUR', 'STN-UDP-05', 29.5, 88.0, 142.0, 52.0, 80.0, 1001.0, 38.0, CURRENT_TIMESTAMP - INTERVAL '15 minutes')
ON CONFLICT DO NOTHING;

-- Weather Alerts
INSERT INTO weather_alerts (
    alert_id, external_source_id, event_type_id, alert_title, severity,
    description, instruction, start_time, expiration_time, alert_status, created_by_user_id
) VALUES
-- Alert 1: Kodagu Flash Flood & Landslide (Emergency)
('50000000-0000-0000-0000-000000000001', 'IMD-BULLETIN-2026-RED-04', 'd0000000-0000-0000-0000-000000000003',
 'RED ALERT: Severe Flash Flood & Inundation in Cauvery Basin', 'EMERGENCY',
 'Intense rainfall exceeding 240mm recorded in 24 hours. River Cauvery at Bhagamandala is flowing 2.5m above danger level.',
 'Immediate evacuation of riverside settlements, elderly and patients to Madikeri General Hospital shelter.',
 CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP + INTERVAL '30 hours', 'ACTIVE', '10000000-0000-0000-0000-000000000001'),

-- Alert 2: Kalaburagi Extreme Heatwave (Warning)
('50000000-0000-0000-0000-000000000002', 'IMD-BULLETIN-2026-HEAT-11', 'd0000000-0000-0000-0000-000000000001',
 'ORANGE ALERT: Severe Heatwave Conditions in Hyderabad-Karnataka Plains', 'WARNING',
 'Max temperatures recorded at 44.8C, heat index crossing 48C. Severe health risk for infants and senior citizens.',
 'Avoid outdoor exposure between 11:00 AM and 4:30 PM. Ensure ORS and adequate hydration centers are activated.',
 CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP + INTERVAL '48 hours', 'ACTIVE', '10000000-0000-0000-0000-000000000002'),

-- Alert 3: Karwar / Coastal Cyclone Alert (Emergency)
('50000000-0000-0000-0000-000000000003', 'IMD-CYCLONE-ARABIAN-03', 'd0000000-0000-0000-0000-000000000004',
 'RED ALERT: Deep Depression Concentrating into Severe Cyclonic Storm off Karwar Coast', 'EMERGENCY',
 'Wind speeds reaching 70-80 km/h gusting to 95 km/h. Sea condition is phenomenal. High tidal inundation predicted.',
 'Total suspension of coastal fishing. Fishermen settlements to be evacuated to Model School Shelter.',
 CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP + INTERVAL '24 hours', 'ACTIVE', '10000000-0000-0000-0000-000000000003'),

-- Alert 4: Bengaluru Urban Thunderstorm Watch
('50000000-0000-0000-0000-000000000004', 'IMD-LOCAL-BLR-09', 'd0000000-0000-0000-0000-000000000005',
 'YELLOW WATCH: Moderate to Heavy Thunderstorms with Waterlogging', 'WATCH',
 'Low lying underpasses and lake breach buffers subject to inundation.',
 'Commuters advised caution near open drains and underpasses.',
 CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '12 hours', 'ACTIVE', '10000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Weather Alert Regions Mapping
INSERT INTO weather_alert_regions (alert_id, region_id, affected_severity) VALUES
('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'RED'),
('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'ORANGE'),
('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'RED'),
('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'ORANGE'),
('50000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'YELLOW')
ON CONFLICT (alert_id, region_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. RISK ASSESSMENTS & SCORING RULES
-- ----------------------------------------------------------------------------
INSERT INTO risk_scoring_rules (rule_id, rule_version, rule_name, parameters, is_active, created_by_user_id) VALUES
('70000000-0000-0000-0000-000000000001', 'v1.0.0-PROD', 'Karnataka Vulnerability Matrix 2026',
 '{"weights": {"age": 0.25, "chronic_medical": 0.35, "hazard_proximity": 0.25, "infrastructure_access": 0.15}, "thresholds": {"high": 75.0, "medium": 45.0}}'::jsonb,
 TRUE, '10000000-0000-0000-0000-000000000001')
ON CONFLICT (rule_version) DO NOTHING;

-- Realistic Risk Assessments (High, Medium, Low)
INSERT INTO risk_assessments (
    assessment_id, person_id, weather_alert_id, rule_id, risk_score,
    risk_classification, assessment_explanation, assessed_at
) VALUES
-- HIGH RISK: Appanna Bopanna in Kodagu (Senior + Oxygen + Flood Zone)
('71000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001',
 94.50, 'HIGH', 'Critically vulnerable: 82yo elderly with oxygen concentrator dependency located inside the active Bhagamandala flood basin under Red Alert.', CURRENT_TIMESTAMP - INTERVAL '5 hours'),

-- HIGH RISK: Dattatreya in Karwar (Elderly + Cyclone Path)
('71000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001',
 89.00, 'HIGH', 'Extreme threat: 75yo senior living directly in Baithkol coastal harbor during active severe cyclonic storm with tidal surge.', CURRENT_TIMESTAMP - INTERVAL '3 hours'),

-- HIGH RISK: Narayanappa in Bengaluru (Bed-bound oxygen dependent)
('71000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001',
 78.50, 'HIGH', 'High risk: 84yo bed-bound senior requiring continuous oxygen and stretcher ambulance support.', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

-- MEDIUM RISK: Mahadevi in Kalaburagi (Senior + Extreme Heatwave)
('71000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000014', '50000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001',
 64.00, 'MEDIUM', 'Moderate heat distress threat: 79yo senior in 44.8C extreme heatwave requiring hydration monitoring and power continuity.', CURRENT_TIMESTAMP - INTERVAL '4 hours'),

-- MEDIUM RISK: Chandrashekar in Bengaluru (Physical Disability)
('71000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001',
 52.00, 'MEDIUM', 'Moderate risk: Person with physical disability in urban waterlogging zone requiring assisted mobility transport.', CURRENT_TIMESTAMP - INTERVAL '1 hour'),

-- LOW RISK: Kaveri Muthappa in Kodagu (Adult Pregnant - Outside immediate flood perimeter)
('71000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000020', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001',
 38.00, 'LOW', 'Low immediate threat: Expectant mother residing in elevated Stuart Hill, equipped with caregiver and direct road access.', CURRENT_TIMESTAMP - INTERVAL '5 hours'),

-- LOW RISK: Divya Nandeesh in Bengaluru (Urban residential)
('71000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001',
 28.00, 'LOW', 'Low risk: Safe multi-story residential building with private power backup and caregiver proximity.', CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (assessment_id) DO NOTHING;

-- Factor Breakdown
INSERT INTO risk_assessment_factors (factor_id, assessment_id, factor_name, factor_weight, factor_score, factor_detail) VALUES
('72000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', 'HAZARD_INUNDATION_FACTOR', 0.35, 98.0, '{"inundation_depth_meters": 1.8, "within_flood_polygon": true}'::jsonb),
('72000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001', 'MEDICAL_DEPENDENCY_FACTOR', 0.40, 95.0, '{"requires_power": true, "equipment": "oxygen_concentrator"}'::jsonb),
('72000000-0000-0000-0000-000000000003', '71000000-0000-0000-0000-000000000001', 'AGE_MOBILITY_FACTOR', 0.25, 90.0, '{"age": 82, "mobility_impaired": true}'::jsonb)
ON CONFLICT (factor_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. EMERGENCY CATEGORIES & EMERGENCY CASES (10 Realistic Cases)
-- ----------------------------------------------------------------------------
INSERT INTO emergency_categories (category_id, category_code, category_name, priority_weight) VALUES
('e0000000-0000-0000-0000-000000000001', 'MEDICAL_ASSISTANCE', 'Urgent Medical & Life Support', 5),
('e0000000-0000-0000-0000-000000000002', 'EVACUATION', 'Emergency Flood/Storm Evacuation', 4),
('e0000000-0000-0000-0000-000000000003', 'RESCUE', 'Search & Rescue / Trapped Individuals', 5),
('e0000000-0000-0000-0000-000000000004', 'FOOD_AND_WATER', 'Emergency Potable Water & Rations', 2),
('e0000000-0000-0000-0000-000000000005', 'TRANSPORTATION', 'Shelter Evacuation Transit', 3),
('e0000000-0000-0000-0000-000000000006', 'OTHER', 'General Disaster Inquiries & Triage', 1)
ON CONFLICT (category_code) DO NOTHING;

INSERT INTO emergency_cases (
    case_id, case_number, reporter_id, affected_person_id, category_id,
    weather_alert_id, description, location, latitude, longitude, address_details,
    priority, current_status, assigned_team_id, resolution_details, reported_at,
    verified_at, assigned_at, resolved_at, closed_at
) VALUES
-- Case 1: In Progress - Bhagamandala Flood Evacuation (Critical)
('60000000-0000-0000-0000-000000000001', 'EMG-2026-0001', '10000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000019',
 'e0000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001',
 'Cauvery water entered ground floor; 82yo father on oxygen requires emergency boat evacuation to Madikeri hospital.',
 ST_GeomFromText('POINT(75.7250 12.4180)', 4326), 12.4180, 75.7250, 'Riverbank Estate, Bhagamandala',
 'CRITICAL', 'IN_PROGRESS', '40000000-0000-0000-0000-000000000003', NULL,
 CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours 45 minutes',
 CURRENT_TIMESTAMP - INTERVAL '3 hours 30 minutes', NULL, NULL),

-- Case 2: Assigned - Karwar Coastal Rescue (Critical)
('60000000-0000-0000-0000-000000000002', 'EMG-2026-0002', '10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000007',
 'e0000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003',
 'High tidal surge breached sea wall; senior fisherman trapped inside roof attic in Baithkol.',
 ST_GeomFromText('POINT(74.1280 14.8150)', 4326), 14.8150, 74.1280, 'Fisheries Colony, Baithkol',
 'CRITICAL', 'ASSIGNED', '40000000-0000-0000-0000-000000000002', NULL,
 CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes',
 CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes', NULL, NULL),

-- Case 3: Verified - Kalaburagi Extreme Heat Stroke Threat (High)
('60000000-0000-0000-0000-000000000003', 'EMG-2026-0003', '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000013',
 'e0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002',
 'Severe dehydration and heat disorientation in 86yo elderly; power transformer burst in neighborhood.',
 ST_GeomFromText('POINT(76.8290 17.3250)', 4326), 17.3250, 76.8290, 'Old Jewargi Road, Brahmpur',
 'HIGH', 'VERIFIED', NULL, NULL,
 CURRENT_TIMESTAMP - INTERVAL '1 hour 15 minutes', CURRENT_TIMESTAMP - INTERVAL '50 minutes',
 NULL, NULL, NULL),

-- Case 4: Reported - Bengaluru Waterlogged Basement (Medium)
('60000000-0000-0000-0000-000000000004', 'EMG-2026-0004', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000003',
 'e0000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000004',
 'Wheelchair user trapped on ground floor due to 2ft storm drain overflow in Ulsoor driveway.',
 ST_GeomFromText('POINT(77.6100 12.9780)', 4326), 12.9780, 77.6100, 'Flat 201 Lakeview Apts, Ulsoor',
 'MEDIUM', 'REPORTED', NULL, NULL,
 CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL, NULL, NULL, NULL),

-- Case 5: Resolved - Karwar Medical Insulin Transport (High)
('60000000-0000-0000-0000-000000000005', 'EMG-2026-0005', '10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008',
 'e0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003',
 'Road cut-off due to fallen trees; dialysis patient required medical transport to Karwar Civil Hospital.',
 ST_GeomFromText('POINT(74.1320 14.8320)', 4326), 14.8320, 74.1320, 'Near Kali River Bridge, Kodibag',
 'HIGH', 'RESOLVED', '40000000-0000-0000-0000-000000000002',
 'SDRF boat unit deployed and safely transported patient to Karwar District Hospital. Dialysis commenced at 11:30 AM.',
 CURRENT_TIMESTAMP - INTERVAL '10 hours', CURRENT_TIMESTAMP - INTERVAL '9 hours 30 minutes',
 CURRENT_TIMESTAMP - INTERVAL '9 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours', NULL),

-- Case 6: Closed - Bengaluru Stretcher Transfer (Critical)
('60000000-0000-0000-0000-000000000006', 'EMG-2026-0006', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005',
 'e0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004',
 'Power grid failure in Domlur caused battery inverter on oxygen concentrator to trigger critical low alarm.',
 ST_GeomFromText('POINT(77.6150 12.9640)', 4326), 12.9640, 77.6150, '#22 Domlur Village',
 'CRITICAL', 'CLOSED', '40000000-0000-0000-0000-000000000001',
 'NDRF rapid medical team provided portable oxygen cylinder and transferred patient to Kanteerava Stadium medical shelter with generator backup.',
 CURRENT_TIMESTAMP - INTERVAL '24 hours', CURRENT_TIMESTAMP - INTERVAL '23 hours 40 minutes',
 CURRENT_TIMESTAMP - INTERVAL '23 hours 20 minutes', CURRENT_TIMESTAMP - INTERVAL '21 hours', CURRENT_TIMESTAMP - INTERVAL '18 hours'),

-- Case 7: In Progress - Udupi Malpe High Tide Evacuation (High)
('60000000-0000-0000-0000-000000000007', 'EMG-2026-0007', '10000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000025',
 'e0000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003',
 'Coastal erosion and sea waves entering beachfront hut in Malpe; 77yo senior with mobility challenge.',
 ST_GeomFromText('POINT(74.7380 13.3390)', 4326), 13.3390, 74.7380, 'Malpe Beach Fishermen Colony',
 'HIGH', 'IN_PROGRESS', '40000000-0000-0000-0000-000000000002', NULL,
 CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours 40 minutes',
 CURRENT_TIMESTAMP - INTERVAL '2 hours 20 minutes', NULL, NULL),

-- Case 8: Reported - Kalaburagi Infant Dehydration Relief (Medium)
('60000000-0000-0000-0000-000000000008', 'EMG-2026-0008', '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000017',
 'e0000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002',
 'Extreme heat has disrupted piped potable water in Maktampura; infant requiring clean water and electrolyte pack.',
 ST_GeomFromText('POINT(76.8450 17.3310)', 4326), 17.3310, 76.8450, 'Maktampura Ring Road',
 'MEDIUM', 'REPORTED', NULL, NULL,
 CURRENT_TIMESTAMP - INTERVAL '40 minutes', NULL, NULL, NULL, NULL),

-- Case 9: Assigned - Kodagu Landslide Access Blockage (High)
('60000000-0000-0000-0000-000000000009', 'EMG-2026-0009', '10000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000021',
 'e0000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001',
 'Mudslide blocked doorway of house on hillside in Madikeri; 38yo person with disability unable to climb out.',
 ST_GeomFromText('POINT(75.7420 12.4310)', 4326), 12.4310, 75.7420, 'Kalyan Nagar, Madikeri',
 'HIGH', 'ASSIGNED', '40000000-0000-0000-0000-000000000003', NULL,
 CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes',
 CURRENT_TIMESTAMP - INTERVAL '1 hour 15 minutes', NULL, NULL),

-- Case 10: Resolved - Bengaluru Expectant Mother Transport (Critical)
('60000000-0000-0000-0000-000000000010', 'EMG-2026-0010', '10000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000004',
 'e0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004',
 'Expectant mother went into active labor during heavy flash rain and traffic gridlock in Rajajinagar.',
 ST_GeomFromText('POINT(77.5820 12.9850)', 4326), 12.9850, 77.5820, '#88 Rajajinagar 1st Block',
 'CRITICAL', 'RESOLVED', '40000000-0000-0000-0000-000000000001',
 'Green corridor coordinated by NDRF & Traffic Police. Mother admitted safely to Vani Vilas Hospital at 08:45 AM.',
 CURRENT_TIMESTAMP - INTERVAL '14 hours', CURRENT_TIMESTAMP - INTERVAL '13 hours 45 minutes',
 CURRENT_TIMESTAMP - INTERVAL '13 hours 30 minutes', CURRENT_TIMESTAMP - INTERVAL '11 hours', NULL)
ON CONFLICT (case_number) DO NOTHING;

-- Emergency Case Status Updates (Timeline)
INSERT INTO emergency_case_updates (update_id, case_id, previous_status, new_status, notes, updated_by_user_id) VALUES
('61000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'REPORTED', 'VERIFIED', 'Verified by Madikeri emergency dispatch desk; water level confirmed at 4 feet.', '10000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'VERIFIED', 'ASSIGNED', 'Assigned to Western Ghats Rapid Medical Relief Corps equipped with inflatable rescue raft.', '10000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', 'ASSIGNED', 'IN_PROGRESS', 'Rescue boat reached perimeter road. Navigating flood waters to residence.', '10000000-0000-0000-0000-000000000014')
ON CONFLICT (update_id) DO NOTHING;

-- Case Assignments
INSERT INTO case_assignments (assignment_id, case_id, team_id, assigned_by_user_id, assignment_notes, assignment_status) VALUES
('62000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'High priority boat evacuation with medical oxygen aboard', 'ACTIVE'),
('62000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Deploy zodiac boat with life jackets and ladder', 'ACTIVE'),
('62000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Dialysis transport assistance completed successfully', 'COMPLETED')
ON CONFLICT (assignment_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12. NOTIFICATION MANAGEMENT & LOGS
-- ----------------------------------------------------------------------------
INSERT INTO device_tokens (token_id, user_id, fcm_token, device_os, app_version) VALUES
('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'ExponentPushToken[demo_token_girish_android_2026]', 'ANDROID', 'v1.4.2'),
('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', 'ExponentPushToken[demo_token_karthik_ios_2026]', 'IOS', 'v1.4.2'),
('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000014', 'ExponentPushToken[demo_token_naveen_android_2026]', 'ANDROID', 'v1.4.0')
ON CONFLICT (fcm_token) DO NOTHING;

INSERT INTO notifications (
    notification_id, notification_type, title, body,
    payload, related_weather_alert_id, related_case_id, created_by_user_id
) VALUES
('81000000-0000-0000-0000-000000000001', 'EMERGENCY_ALERT', 'RED ALERT: Cauvery River Spate at Bhagamandala',
 'Evacuation orders issued for low-lying areas. Emergency rescue units active. Contact 112 or SDMA app for pickup.',
 '{"type": "RED_ALERT", "region": "Kodagu", "action": "EVACUATE"}'::jsonb,
 '50000000-0000-0000-0000-000000000001', NULL, '10000000-0000-0000-0000-000000000001'),

('81000000-0000-0000-0000-000000000002', 'CASE_STATUS_UPDATE', 'Emergency Case EMG-2026-0001 In Progress',
 'Western Ghats Medical Relief Corps has been dispatched to your registered location.',
 '{"case_number": "EMG-2026-0001", "status": "IN_PROGRESS"}'::jsonb,
 NULL, '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (notification_id) DO NOTHING;

INSERT INTO notification_recipients (
    recipient_id, notification_id, user_id, phone_number, target_channel,
    delivery_status, sent_at, delivered_at, failure_reason
) VALUES
('82000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', '+91-9800000009', 'PUSH',
 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours 59 minutes', NULL),

('82000000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', '+91-9800000009', 'SMS',
 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours 58 minutes', NULL),

('82000000-0000-0000-0000-000000000003', '81000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000018', '+91-9800000018', 'SMS',
 'FAILED', CURRENT_TIMESTAMP - INTERVAL '5 hours', NULL, 'Telecom network tower disconnected due to storm power loss'),

('82000000-0000-0000-0000-000000000004', '81000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', '+91-9800000009', 'PUSH',
 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '3 hours 30 minutes', CURRENT_TIMESTAMP - INTERVAL '3 hours 29 minutes', NULL)
ON CONFLICT (notification_id, user_id, target_channel) DO NOTHING;

-- Verification Logs from Provider
INSERT INTO notification_delivery_logs (
    log_id, recipient_id, provider_name, provider_message_id, event_type,
    provider_response_code, provider_raw_response
) VALUES
('83000000-0000-0000-0000-000000000001', '82000000-0000-0000-0000-000000000001', 'FCM', 'projects/demo-emergency/messages/fcm_msg_001',
 'DELIVERED', '200_OK', '{"status": "SUCCESS", "multicast_id": 91823912}'::jsonb),

('83000000-0000-0000-0000-000000000002', '82000000-0000-0000-0000-000000000002', 'MSG91', 'msg91_dlr_sms_98124',
 'DELIVERED', 'DELIVRD', '{"sender": "KARDMA", "status": "DELIVERED"}'::jsonb),

('83000000-0000-0000-0000-000000000003', '82000000-0000-0000-0000-000000000003', 'MSG91', 'msg91_dlr_sms_98125',
 'DELIVERY_FAILED', 'UNDELIV', '{"error_code": "NETWORK_UNAVAILABLE"}'::jsonb)
ON CONFLICT (log_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. AUDIT & CONSENT RECORDS
-- ----------------------------------------------------------------------------
INSERT INTO consent_records (
    consent_id, person_id, consenting_user_id, consent_type, consent_status,
    consent_document_hash, granted_at, ip_address
) VALUES
('90000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000009',
 'LOCATION_TRACKING', 'GRANTED', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
 CURRENT_TIMESTAMP - INTERVAL '30 days', '106.51.78.21'),

('90000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000009',
 'EMERGENCY_EVACUATION', 'GRANTED', 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
 CURRENT_TIMESTAMP - INTERVAL '30 days', '106.51.78.21')
ON CONFLICT (consent_id) DO NOTHING;

INSERT INTO audit_logs (
    audit_id, user_id, action, entity_affected, entity_id, relevant_changes, operation_status, ip_address
) VALUES
('91000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'STATUS_CHANGE', 'emergency_cases',
 '60000000-0000-0000-0000-000000000001', '{"field": "current_status", "old": "VERIFIED", "new": "ASSIGNED"}'::jsonb,
 'SUCCESS', '10.200.1.45'),

('91000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CREATE', 'weather_alerts',
 '50000000-0000-0000-0000-000000000001', '{"title": "RED ALERT: Severe Flash Flood & Inundation in Cauvery Basin"}'::jsonb,
 'SUCCESS', '10.200.1.45')
ON CONFLICT (audit_id) DO NOTHING;

COMMIT;
