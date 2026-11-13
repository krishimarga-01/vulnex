-- ====================================================================
-- Flyway Migration V2: Seed Data for Demonstration & Testing
-- Password for all seed users is: Password@123
-- BCrypt: $2a$10$1rYQyI6EwZzQy5Zc5h3s0.d4uH.Y21Yl17Z0xWf6P67L3zWf2J5a2
-- ====================================================================

-- 1. ROLES
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'System Administrator with full access'),
('ROLE_AUTHORITY', 'Disaster Management and Municipal Emergency Authority'),
('ROLE_CAREGIVER', 'Caregiver responsible for vulnerable family members/patients'),
('ROLE_CITIZEN', 'General citizen with mobile access and SOS reporting'),
('ROLE_VOLUNTEER', 'Community disaster response volunteer')
ON CONFLICT (name) DO NOTHING;

-- 2. USERS
-- All use BCrypt hash of "Password@123"
INSERT INTO users (username, email, password_hash, full_name, phone_number, role, account_status, emergency_contact_name, emergency_contact_phone)
VALUES
('admin', 'admin@disasterresponse.gov', '$2a$10$1rYQyI6EwZzQy5Zc5h3s0.d4uH.Y21Yl17Z0xWf6P67L3zWf2J5a2', 'Admin Controller', '+1-555-0100', 'ROLE_ADMIN', 'ACTIVE', 'HQ Dispatch', '+1-555-0109'),
('officer_raj', 'officer.raj@disasterresponse.gov', '$2a$10$1rYQyI6EwZzQy5Zc5h3s0.d4uH.Y21Yl17Z0xWf6P67L3zWf2J5a2', 'Rajesh Sharma (Disaster Commissioner)', '+1-555-0101', 'ROLE_AUTHORITY', 'ACTIVE', 'Emergency Ops Command', '+1-555-0108'),
('caregiver_mary', 'mary.caregiver@example.com', '$2a$10$1rYQyI6EwZzQy5Zc5h3s0.d4uH.Y21Yl17Z0xWf6P67L3zWf2J5a2', 'Mary Johnson (Caregiver)', '+1-555-0102', 'ROLE_CAREGIVER', 'ACTIVE', 'Dr. Smith Clinic', '+1-555-0110'),
('citizen_john', 'john.citizen@example.com', '$2a$10$1rYQyI6EwZzQy5Zc5h3s0.d4uH.Y21Yl17Z0xWf6P67L3zWf2J5a2', 'John Doe (Citizen)', '+1-555-0103', 'ROLE_CITIZEN', 'ACTIVE', 'Jane Doe', '+1-555-0111'),
('volunteer_sarah', 'sarah.volunteer@example.com', '$2a$10$1rYQyI6EwZzQy5Zc5h3s0.d4uH.Y21Yl17Z0xWf6P67L3zWf2J5a2', 'Sarah Connor (First Responder Volunteer)', '+1-555-0104', 'ROLE_VOLUNTEER', 'ACTIVE', 'Red Cross Unit 4', '+1-555-0112')
ON CONFLICT (username) DO NOTHING;

-- 3. RISK SCORING RULES (Configurable & Explainable)
INSERT INTO risk_scoring_rules (rule_code, category, description, condition_field, operator, threshold_value, score_weight, is_active)
VALUES
('AGE_ELDERLY_EXTREME', 'AGE', 'Elderly population age 75 or above', 'age', 'GREATER_THAN_EQUAL', '75', 20.0, true),
('AGE_CHILD_INFANT', 'AGE', 'Infants and toddlers below age 5', 'age', 'LESS_THAN_EQUAL', '5', 15.0, true),
('VULN_DISABILITY', 'VULNERABILITY_TYPE', 'Person with significant physical or cognitive disability', 'vulnerabilityCategory', 'EQUALS', 'DISABILITY', 25.0, true),
('VULN_MEDICAL', 'VULNERABILITY_TYPE', 'Person requiring continuous electricity or oxygen/medical assistance', 'vulnerabilityCategory', 'EQUALS', 'MEDICAL_ASSISTANCE', 25.0, true),
('VULN_PREGNANT', 'VULNERABILITY_TYPE', 'Expectant mother in late term', 'vulnerabilityCategory', 'EQUALS', 'PREGNANT', 20.0, true),
('MOBILITY_BEDRIDDEN', 'MOBILITY', 'Bedridden individual unable to evacuate independently', 'mobilityStatus', 'EQUALS', 'BEDRIDDEN', 30.0, true),
('MOBILITY_WHEELCHAIR', 'MOBILITY', 'Wheelchair bound needing ramp/accessible transport', 'mobilityStatus', 'EQUALS', 'WHEELCHAIR', 20.0, true),
('WEATHER_HEAT_EXTREME', 'WEATHER_SEVERITY', 'Extreme heatwave warning in area (>42C)', 'weatherSeverity', 'EQUALS', 'EXTREME', 25.0, true),
('WEATHER_FLOOD_CRITICAL', 'WEATHER_SEVERITY', 'Severe flood or flash flood inundation risk', 'weatherSeverity', 'EQUALS', 'EXTREME', 30.0, true),
('WEATHER_CYCLONE_SEVERE', 'WEATHER_SEVERITY', 'High velocity cyclone storm warning', 'weatherSeverity', 'EQUALS', 'SEVERE', 25.0, true),
('SUPPORT_NO_CAREGIVER', 'SUPPORT_AVAILABILITY', 'Vulnerable person has no assigned primary caregiver', 'caregiverAssigned', 'EQUALS', 'FALSE', 15.0, true)
ON CONFLICT (rule_code) DO NOTHING;

-- 4. RESPONSE TEAMS
INSERT INTO response_teams (team_name, team_type, contact_phone, base_location_name, is_available, current_capacity)
VALUES
('Coastal Rapid Rescue Unit 1', 'RESCUE', '+1-555-9001', 'District Harbor Station', true, 8),
('Mobile Critical Care Unit Alpha', 'MEDICAL', '+1-555-9002', 'General Hospital East Wing', true, 5),
('Civil Defense Evacuation Transport 3', 'EVACUATION', '+1-555-9003', 'Central Transit Terminal', true, 12)
ON CONFLICT DO NOTHING;

-- 5. GEOGRAPHICAL REGIONS
INSERT INTO geographical_regions (name, region_code, region_type, center_latitude, center_longitude, current_risk_level, active_alert_count, population)
VALUES
('Coastal Ward Sector 4', 'RGN-COAST-04', 'WARD', 13.0827, 80.2707, 'HIGH', 1, 45000),
('Riverside Lowland Basin', 'RGN-RIVER-02', 'MUNICIPALITY', 13.0450, 80.2200, 'MEDIUM', 1, 32000),
('Upland Hill Plateau', 'RGN-HILL-01', 'DISTRICT', 13.1200, 80.1800, 'LOW', 0, 28000)
ON CONFLICT (region_code) DO NOTHING;

-- 6. VULNERABLE PERSONS (With initial coordinates and profiles)
INSERT INTO vulnerable_persons (
    national_id, full_name, age, date_of_birth, gender, vulnerability_category,
    medical_conditions, mobilityStatus, assistance_requirements, contact_number,
    address, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    latitude, longitude, registered_by_user_id, caregiver_user_id, verification_status,
    consent_given, current_risk_level, current_risk_score
) VALUES
(
    'NAT-ID-1001', 'Eleanor Vance', 82, '1944-03-15', 'FEMALE', 'ELDERLY',
    'Severe congestive heart failure, needs supplemental oxygen', 'BEDRIDDEN', 'Needs electric oxygen concentrator and stretcher evacuation', '+1-555-3001',
    '12 Marina Beach Road, Coastal Sector 4', 'Mary Johnson', '+1-555-0102', 'Daughter / Caregiver',
    13.0830, 80.2710, 3, 3, 'VERIFIED', true, 'HIGH', 85.0
),
(
    'NAT-ID-1002', 'Thomas Miller', 4, '2022-06-10', 'MALE', 'CHILD',
    'Asthma with bronchospasms under high heat/humidity', 'INDEPENDENT', 'Pediatric nebulizer and air-conditioned shelter', '+1-555-3002',
    '45 Riverbed Lane, Riverside Lowland', 'John Doe', '+1-555-0103', 'Father',
    13.0460, 80.2210, 4, NULL, 'VERIFIED', true, 'MEDIUM', 55.0
),
(
    'NAT-ID-1003', 'Amina Begum', 28, '1998-08-22', 'FEMALE', 'PREGNANT',
    'Third trimester high-risk pregnancy (36 weeks)', 'INDEPENDENT', 'Obstetric monitoring and rapid transport access to maternity hospital', '+1-555-3003',
    '88 Lighthouse Hill, Coastal Sector 4', 'Farhan Begum', '+1-555-3004', 'Spouse',
    13.0845, 80.2730, 4, NULL, 'VERIFIED', true, 'HIGH', 75.0
),
(
    'NAT-ID-1004', 'Samuel Lee', 45, '1981-11-05', 'MALE', 'DISABILITY',
    'Paraplegic following spinal trauma', 'WHEELCHAIR', 'Wheelchair lift van and accessible emergency shelter', '+1-555-3005',
    '23 Park View Avenue, Upland Plateau', 'Alice Lee', '+1-555-3006', 'Sister',
    13.1210, 80.1810, 5, 5, 'VERIFIED', true, 'LOW', 35.0
)
ON CONFLICT (national_id) DO NOTHING;

-- 7. CAREGIVER RELATIONSHIP
INSERT INTO caregiver_relationships (caregiver_user_id, vulnerable_person_id, relationship_type, is_primary, verified)
VALUES
(3, 1, 'DAUGHTER', true, true),
(5, 4, 'VOLUNTEER_CAREGIVER', true, true)
ON CONFLICT (caregiver_user_id, vulnerable_person_id) DO NOTHING;

-- 8. WEATHER OBSERVATIONS
INSERT INTO weather_observations (region_id, region_name, latitude, longitude, temperature, feels_like, precipitation, humidity, wind_speed, weather_condition, is_simulated)
VALUES
(1, 'Coastal Ward Sector 4', 13.0827, 80.2707, 43.5, 48.2, 0.0, 78.0, 32.0, 'Extreme Heatwave and Coastal Swell', false),
(2, 'Riverside Lowland Basin', 13.0450, 80.2200, 39.0, 43.0, 15.0, 85.0, 20.0, 'Thunderstorm and Heavy Rain', false),
(3, 'Upland Hill Plateau', 13.1200, 80.1800, 31.0, 33.0, 2.0, 60.0, 14.0, 'Partly Cloudy', false);

-- 9. WEATHER ALERTS
INSERT INTO weather_alerts (alert_code, alert_type, severity, headline, description, safety_instructions, affected_region_name, effective_from, effective_until, is_active, issued_by_user_id)
VALUES
(
    'ALERT-HW-2026-001', 'HEATWAVE', 'EXTREME',
    'RED ALERT: Critical Heatwave Conditions Exceeding 43°C',
    'Severe heat wave warning with heat index touching 48°C. Dangerous for elderly, young children, and bedridden individuals.',
    'Stay indoors, maintain hydration, operate cooling centers, ensure continuous power for medical equipment.',
    'Coastal Ward Sector 4', CURRENT_TIMESTAMP - INTERVAL '2 HOUR', CURRENT_TIMESTAMP + INTERVAL '24 HOUR', true, 2
),
(
    'ALERT-FL-2026-002', 'FLOOD', 'SEVERE',
    'ORANGE ALERT: Riverbed Inundation and Flash Flood Warning',
    'Rapid water level rise observed along low-lying river canal basin following upstream cloudburst.',
    'Move vulnerable citizens to higher ground. Avoid crossing flooded causeways.',
    'Riverside Lowland Basin', CURRENT_TIMESTAMP - INTERVAL '1 HOUR', CURRENT_TIMESTAMP + INTERVAL '12 HOUR', true, 2
)
ON CONFLICT (alert_code) DO NOTHING;

-- 10. EMERGENCY CASES
INSERT INTO emergency_cases (case_number, reporter_user_id, affected_person_id, emergency_category, description, priority, latitude, longitude, address, status, assigned_team_id)
VALUES
(
    'EC-2026-001', 3, 1, 'MEDICAL_ASSISTANCE',
    'Power outage at residence; oxygen concentrator battery down to 20%. Elderly patient experiencing shortness of breath in 43°C heat.',
    'CRITICAL', 13.0830, 80.2710, '12 Marina Beach Road, Coastal Sector 4', 'ASSIGNED', 2
),
(
    'EC-2026-002', 4, 2, 'EVACUATION',
    'Water level rising near doorstep in riverside area. Need safe transit for child with asthma to nearest shelter.',
    'HIGH', 13.0460, 80.2210, '45 Riverbed Lane, Riverside Lowland', 'REPORTED', NULL
)
ON CONFLICT (case_number) DO NOTHING;

-- 11. CASE ASSIGNMENT
INSERT INTO case_assignments (emergency_case_id, response_team_id, assigned_by_user_id, notes, status)
VALUES
(1, 2, 2, 'Dispatched Mobile Critical Care Unit Alpha with emergency portable power inverter and oxygen cylinders.', 'ACTIVE');
