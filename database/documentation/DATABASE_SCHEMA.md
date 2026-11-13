# Database Schema Data Dictionary
## Extreme Weather Vulnerability Identification and Emergency Response System

This document specifies the complete, authoritative technical data dictionary for the PostgreSQL 16 + PostGIS database.

---

### Module 1: User Management (`V1__create_user_management.sql`)

#### 1. `roles`
System access roles for RBAC.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `role_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Unique role identifier |
| `role_name` | VARCHAR(50) | NO | UNIQUE, CHECK (`CITIZEN`, `CAREGIVER`, `VOLUNTEER`, `AUTHORITY`, `ADMIN`) | Canonical system role name |
| `description` | VARCHAR(255) | YES | | Human-readable role description |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Record creation timestamp |

#### 2. `users`
Master user directory for all application personas.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Unique user identifier |
| `full_name` | VARCHAR(150) | NO | | Legal full name |
| `email` | VARCHAR(255) | NO | UNIQUE, Regex Check | Unique login email |
| `phone_number` | VARCHAR(20) | NO | UNIQUE | E.164 / formatted primary contact number |
| `password_hash` | VARCHAR(255) | NO | | BCrypt / Argon2 salted hash |
| `account_status` | VARCHAR(30) | NO | DEFAULT `'ACTIVE'`, CHECK (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`, `DEACTIVATED`) | Account lifecycle state |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Maintained by trigger |
| `deleted_at` | TIMESTAMPTZ | YES | NULL | Soft-delete timestamp |

#### 3. `user_roles`
Junction table mapping users to roles.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | UUID | NO | FK -> `users(user_id)` ON DELETE CASCADE | Target user |
| `role_id` | UUID | NO | FK -> `roles(role_id)` ON DELETE RESTRICT | Assigned role |
| `assigned_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Assignment timestamp |
| **PK** | | | PRIMARY KEY (`user_id`, `role_id`) | Composite primary key |

#### 4. `user_sessions`
JWT / OAuth refresh session storage.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `session_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Session UUID |
| `user_id` | UUID | NO | FK -> `users(user_id)` ON DELETE CASCADE | Associated user |
| `refresh_token_hash` | VARCHAR(255) | NO | | SHA-256 hash of refresh token |
| `device_info` | VARCHAR(255) | YES | | Operating system and client string |
| `ip_address` | VARCHAR(45) | YES | | IPv4 or IPv6 client address |
| `is_revoked` | BOOLEAN | NO | DEFAULT `FALSE` | Revocation status |
| `expires_at` | TIMESTAMPTZ | NO | | Session expiration deadline |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Session start timestamp |

#### 5. `emergency_contacts`
User-designated points of contact.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `contact_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Contact identifier |
| `user_id` | UUID | NO | FK -> `users(user_id)` ON DELETE CASCADE | User owning this contact |
| `contact_name` | VARCHAR(150) | NO | | Contact person name |
| `relationship` | VARCHAR(50) | NO | | e.g. SPOUSE, PARENT, NEIGHBOR |
| `phone_number` | VARCHAR(20) | NO | | Primary phone number |
| `alternative_phone`| VARCHAR(20) | YES | | Backup phone number |
| `priority_order` | INT | NO | DEFAULT `1`, CHECK (`priority_order > 0`) | Call sequence priority |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Maintenance trigger |

---

### Module 2: Vulnerable Population Management (`V2__create_vulnerability_management.sql`)

#### 6. `vulnerability_categories`
Master categories for high-risk populations.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `category_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Category UUID |
| `category_code` | VARCHAR(50) | NO | UNIQUE, CHECK (`ELDERLY`, `CHILD`, `PERSON_WITH_DISABILITY`, `PREGNANT_WOMAN`, `MEDICAL_ASSISTANCE_REQUIRED`) | Standardized category code |
| `category_name` | VARCHAR(100) | NO | | Display label |
| `description` | TEXT | YES | | Scope details |
| `base_vulnerability_weight` | NUMERIC(4,2) | NO | DEFAULT `1.00`, CHECK (`> 0`) | Algorithmic baseline weight |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |

#### 7. `assistance_requirements`
Catalog of physical, medical, and equipment assistance.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `requirement_id`| UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Requirement UUID |
| `requirement_code`| VARCHAR(50) | NO | UNIQUE | e.g. `OXYGEN_SUPPORT`, `WHEELCHAIR_ACCESS` |
| `requirement_name`| VARCHAR(100)| NO | | Friendly name |
| `priority_level`| VARCHAR(20) | NO | DEFAULT `'STANDARD'`, CHECK (`STANDARD`, `URGENT`, `CRITICAL`) | Triage urgency |
| `description` | TEXT | YES | | Technical specifications |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |

#### 8. `vulnerable_persons`
Central registry of vulnerable citizens.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `person_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Unique individual UUID |
| `registered_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Registering user/caregiver |
| `full_name` | VARCHAR(150) | NO | | Individual legal name |
| `date_of_birth` | DATE | YES | | Date of birth |
| `age` | INT | YES | CHECK (`0 <= age <= 130`) | Current calculated age |
| `age_category` | VARCHAR(30) | NO | CHECK (`INFANT`, `CHILD`, `ADULT`, `SENIOR_CITIZEN`) | Age grouping |
| `gender` | VARCHAR(20) | YES | CHECK (`MALE`, `FEMALE`, `OTHER`, `UNDISCLOSED`) | Biological/chosen gender |
| `primary_phone` | VARCHAR(20) | YES | | Personal contact phone |
| `address_line` | TEXT | YES | | House/building/street address |
| `village_or_locality` | VARCHAR(100)| YES | | Ward / Gram Panchayat / Locality |
| `taluk` | VARCHAR(100)| YES | | Sub-district / Taluk |
| `district` | VARCHAR(100)| NO | | District (e.g. Kodagu, Kalaburagi) |
| `state` | VARCHAR(100)| NO | DEFAULT `'Karnataka'` | State jurisdiction |
| `postal_code` | VARCHAR(15) | YES | | PIN / Postal code |
| `primary_category_id` | UUID | NO | FK -> `vulnerability_categories(category_id)` ON DELETE RESTRICT | Primary vulnerability class |
| `geographical_region_id` | UUID | YES | FK -> `geographical_regions(region_id)` ON DELETE SET NULL | Administrative region |
| `location` | GEOMETRY(Point, 4326) | YES | PostGIS 2D Point (WGS 84) | Exact GPS coordinate |
| `latitude` | NUMERIC(10,8) | YES | CHECK (`-90.0 <= lat <= 90.0`) | Latitude decimal degrees |
| `longitude` | NUMERIC(11,8) | YES | CHECK (`-180.0 <= lon <= 180.0`)| Longitude decimal degrees |
| `verification_status` | VARCHAR(30) | NO | DEFAULT `'UNVERIFIED'`, CHECK (`UNVERIFIED`, `VERIFIED`, `REJECTED`) | Field official verification |
| `verified_by_user_id` | UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Authority verifier |
| `verified_at` | TIMESTAMPTZ | YES | | Verification completion time |
| `consent_status` | VARCHAR(30) | NO | DEFAULT `'GIVEN'`, CHECK (`GIVEN`, `WITHDRAWN`, `PENDING`) | DPDP consent status |
| `consent_date` | TIMESTAMPTZ | YES | DEFAULT `CURRENT_TIMESTAMP` | Consent grant date |
| `medical_notes_encrypted` | TEXT | YES | | Encrypted medical triage memo |
| `is_active` | BOOLEAN | NO | DEFAULT `TRUE` | Active tracking flag |
| `deleted_at` | TIMESTAMPTZ | YES | NULL | Soft-delete timestamp |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Registry timestamp |
| `updated_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Maintenance trigger |

#### 9. `caregiver_relationships`
Junction mapping caregivers to vulnerable family members.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `relationship_id`| UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Relationship UUID |
| `caregiver_user_id`| UUID | NO | FK -> `users(user_id)` ON DELETE CASCADE | Caregiver user account |
| `person_id` | UUID | NO | FK -> `vulnerable_persons(person_id)` ON DELETE CASCADE | Vulnerable dependent |
| `relationship_type`| VARCHAR(50)| NO | CHECK (`PARENT`, `GUARDIAN`, `SPOUSE`, `CHILD`, `PROFESSIONAL_CAREGIVER`, `SIBLING`, `VOLUNTEER_GUARDIAN`) | Kinship or legal status |
| `is_primary` | BOOLEAN | NO | DEFAULT `TRUE` | Primary decision maker flag |
| `emergency_authorization` | BOOLEAN | NO | DEFAULT `TRUE` | Authorized for rescue consent |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |
| **UQ** | | | UNIQUE (`caregiver_user_id`, `person_id`) | One relationship per pair |

#### 10. `person_assistance_requirements`
Junction table supporting multiple assistance requirements per individual.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `person_id` | UUID | NO | FK -> `vulnerable_persons(person_id)` ON DELETE CASCADE | Vulnerable person |
| `requirement_id`| UUID | NO | FK -> `assistance_requirements(requirement_id)` ON DELETE RESTRICT | Assistance specification |
| `notes` | TEXT | YES | | Patient-specific notes |
| `is_critical` | BOOLEAN | NO | DEFAULT `FALSE` | Immediate life-threat flag |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |
| **PK** | | | PRIMARY KEY (`person_id`, `requirement_id`) | Composite primary key |

#### 11. `person_emergency_contacts`
Dedicated contacts tied directly to vulnerable persons.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `person_contact_id`| UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Contact UUID |
| `person_id` | UUID | NO | FK -> `vulnerable_persons(person_id)` ON DELETE CASCADE | Target vulnerable individual |
| `contact_name` | VARCHAR(150) | NO | | Contact name |
| `relationship` | VARCHAR(50) | NO | | Relationship label |
| `phone_number` | VARCHAR(20) | NO | | Phone number |
| `alternative_phone`| VARCHAR(20)| YES | | Alternative number |
| `priority_order`| INT | NO | DEFAULT `1`, CHECK (`> 0`) | Dialing sequence |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |

---

### Module 3: Geographical Management (`V3__create_geographical_management.sql`)

#### 12. `geographical_regions`
Administrative boundaries and baseline hazard classifications.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `region_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Unique region UUID |
| `region_code` | VARCHAR(50) | NO | UNIQUE | Administrative code (e.g. `KA-BLR-01`) |
| `region_name` | VARCHAR(100) | NO | | Region title |
| `state` | VARCHAR(100) | NO | DEFAULT `'Karnataka'` | State name |
| `district` | VARCHAR(100) | NO | | District name |
| `taluk` | VARCHAR(100) | YES | | Taluk / Sub-division |
| `village_or_locality` | VARCHAR(100)| YES | | Village / Locality |
| `boundary` | GEOMETRY(MultiPolygon, 4326)| NO | PostGIS MultiPolygon | Spatial boundary polygon |
| `centroid` | GEOMETRY(Point, 4326) | NO | PostGIS Point | Spatial geographic center |
| `latitude` | NUMERIC(10,8) | NO | CHECK (`-90.0 <= lat <= 90.0`) | Centroid latitude |
| `longitude` | NUMERIC(11,8) | NO | CHECK (`-180.0 <= lon <= 180.0`)| Centroid longitude |
| `region_risk_level` | VARCHAR(20) | NO | DEFAULT `'LOW'`, CHECK (`LOW`, `MEDIUM`, `HIGH`, `SEVERE`) | Baseline vulnerability score |
| `elevation_meters` | NUMERIC(8,2) | YES | | Elevation above sea level |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Maintenance trigger |

#### 13. `affected_zones`
Dynamic real-time disaster perimeters.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `zone_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Zone UUID |
| `zone_name` | VARCHAR(150) | NO | | Zone name |
| `hazard_type` | VARCHAR(50) | NO | CHECK (`FLOOD_INUNDATION`, `CYCLONE_PATH`, `HEATWAVE_CORRIDOR`, `LANDSLIDE_PRONE`) | Hazard category |
| `severity_level`| VARCHAR(20) | NO | CHECK (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) | Real-time severity |
| `boundary` | GEOMETRY(Polygon, 4326)| NO | PostGIS Polygon | Dynamic footprint perimeter |
| `is_active` | BOOLEAN | NO | DEFAULT `TRUE` | Active status flag |
| `effective_from`| TIMESTAMPTZ | NO | | Active start time |
| `effective_to` | TIMESTAMPTZ | YES | CHECK (`effective_to >= effective_from`) | Expiration time |
| `created_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Authority user who drew polygon |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |

#### 14. `shelters`
Emergency shelters and relief centers.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `shelter_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Shelter UUID |
| `shelter_code` | VARCHAR(50) | NO | UNIQUE | Code (e.g. `SHL-BLR-01`) |
| `shelter_name` | VARCHAR(150) | NO | | Name |
| `shelter_type` | VARCHAR(50) | NO | CHECK (`SCHOOL`, `COMMUNITY_HALL`, `STADIUM`, `HOSPITAL`, `TEMPORARY_CAMP`) | Building type |
| `district` | VARCHAR(100) | NO | | District |
| `taluk` | VARCHAR(100) | YES | | Taluk |
| `address` | TEXT | NO | | Physical address |
| `location` | GEOMETRY(Point, 4326)| NO | PostGIS Point | Spatial GPS coordinate |
| `latitude` | NUMERIC(10,8) | NO | CHECK (`-90.0 <= lat <= 90.0`) | Latitude |
| `longitude` | NUMERIC(11,8) | NO | CHECK (`-180.0 <= lon <= 180.0`)| Longitude |
| `contact_person_name`| VARCHAR(150)| YES | | Manager name |
| `contact_phone`| VARCHAR(20) | YES | | Manager phone |
| `is_accessible_disabled`| BOOLEAN | NO | DEFAULT `TRUE` | Wheelchair ramp / accessibility |
| `has_medical_facility`| BOOLEAN | NO | DEFAULT `FALSE`| On-site clinic / nurses |
| `has_backup_power`| BOOLEAN | NO | DEFAULT `TRUE` | Diesel generator backup |
| `status` | VARCHAR(30) | NO | DEFAULT `'ACTIVE'`, CHECK (`ACTIVE`, `FULL`, `CLOSED`, `MAINTENANCE`) | Shelter operational status |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Maintenance trigger |

#### 15. `shelter_capacity`
Live capacity and special needs bed tracking.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `capacity_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Capacity record UUID |
| `shelter_id` | UUID | NO | UNIQUE, FK -> `shelters(shelter_id)` ON DELETE CASCADE | Associated shelter |
| `total_capacity`| INT | NO | CHECK (`>= 0`) | Total bed capacity |
| `current_occupancy`| INT | NO | DEFAULT `0`, CHECK (`0 <= occ <= total`) | Current evacuee count |
| `available_capacity`| INT | NO | GENERATED ALWAYS AS (`total - occ`) STORED | Available regular slots |
| `special_care_capacity`| INT | NO | DEFAULT `0`, CHECK (`>= 0`) | Medical / disability bed slots |
| `special_care_occupancy`| INT | NO | DEFAULT `0`, CHECK (`0 <= occ <= spec_cap`) | Occupied special slots |
| `last_updated_at`| TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Last updated timestamp |
| `updated_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Authority updater |

---

### Module 4: Weather Monitoring (`V4__create_weather_management.sql`)

#### 16. `weather_event_types`
Meteorological threat classifications.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `event_type_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Event type UUID |
| `event_code` | VARCHAR(50) | NO | UNIQUE, CHECK (`EXTREME_HEAT`, `HEAVY_RAINFALL`, `FLOOD`, `CYCLONE`, `SEVERE_STORM`) | Standard meteorological code |
| `event_name` | VARCHAR(100) | NO | | Display title |
| `severity_scale_description`| TEXT | YES | | Threshold criteria |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |

#### 17. `weather_observations`
Telemetry measurements from sensors/IMD.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `observation_id`| UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Observation UUID |
| `region_id` | UUID | NO | FK -> `geographical_regions(region_id)` ON DELETE CASCADE | Target region |
| `weather_provider`| VARCHAR(100)| NO | | e.g. `IMD_BENGALURU` |
| `source_station_id`| VARCHAR(100)| YES| | Automated weather station ID |
| `temperature_celsius`| NUMERIC(5,2)| YES | | Surface temperature in Celsius |
| `relative_humidity_percent`| NUMERIC(5,2)| YES | CHECK (`0.0 <= hum <= 100.0`) | Relative humidity % |
| `rainfall_mm` | NUMERIC(7,2) | YES | CHECK (`>= 0.0`) | 24-hour rainfall in mm |
| `wind_speed_kmh`| NUMERIC(6,2)| YES | CHECK (`>= 0.0`) | Wind speed in km/h |
| `wind_gust_kmh` | NUMERIC(6,2)| YES | | Maximum wind gust in km/h |
| `atmospheric_pressure_hpa`| NUMERIC(7,2)| YES| | Pressure in hPa |
| `heat_index_celsius`| NUMERIC(5,2)| YES| | Calculated heat index |
| `raw_payload` | JSONB | YES | | Selective raw provider payload |
| `observation_timestamp`| TIMESTAMPTZ| NO| | Sensor reading timestamp |
| `recorded_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Ingestion timestamp |

#### 18. `weather_alerts`
Official meteorological warnings and alerts.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `alert_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Alert UUID |
| `external_source_id`| VARCHAR(100)| YES| | IMD bulletin ID |
| `event_type_id` | UUID | NO | FK -> `weather_event_types(event_type_id)` ON DELETE RESTRICT | Threat category |
| `alert_title` | VARCHAR(200) | NO | | Warning headline |
| `severity` | VARCHAR(30) | NO | CHECK (`WARNING`, `WATCH`, `ADVISORY`, `EMERGENCY`) | Alert severity tier |
| `description` | TEXT | NO | | Meteorological narrative |
| `instruction` | TEXT | YES | | Safety instructions |
| `start_time` | TIMESTAMPTZ | NO | | Effective commencement |
| `expiration_time`| TIMESTAMPTZ | NO | CHECK (`expiration_time > start_time`) | Expiration deadline |
| `alert_status` | VARCHAR(30) | NO | DEFAULT `'ACTIVE'`, CHECK (`ACTIVE`, `EXPIRED`, `CANCELLED`, `SUPERSEDED`) | Alert lifecycle state |
| `created_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Authority creator |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Issuance timestamp |
| `updated_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Maintenance trigger |

#### 19. `weather_alert_regions`
Junction mapping one alert to multiple affected regions.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `alert_id` | UUID | NO | FK -> `weather_alerts(alert_id)` ON DELETE CASCADE | Target alert |
| `region_id` | UUID | NO | FK -> `geographical_regions(region_id)` ON DELETE CASCADE | Affected region |
| `affected_severity`| VARCHAR(30)| YES | CHECK (`YELLOW`, `ORANGE`, `RED`, `STANDARD`) | Color-coded severity |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Association timestamp |
| **PK** | | | PRIMARY KEY (`alert_id`, `region_id`) | Composite primary key |

---

### Module 5: Risk Assessment (`V5__create_risk_assessment.sql`)

#### 20. `risk_scoring_rules`
Configurable scoring parameters used by Java Spring Boot calculation engine.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `rule_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Rule UUID |
| `rule_version` | VARCHAR(30) | NO | UNIQUE | Semantic version (e.g. `v1.0.0-PROD`) |
| `rule_name` | VARCHAR(150) | NO | | Rule designation |
| `parameters` | JSONB | NO | | Weights, multipliers, thresholds |
| `is_active` | BOOLEAN | NO | DEFAULT `TRUE` | Active rule version flag |
| `created_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Authority author |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |

#### 21. `risk_assessments`
Computed risk classifications for individuals.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `assessment_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Assessment UUID |
| `person_id` | UUID | NO | FK -> `vulnerable_persons(person_id)` ON DELETE CASCADE | Evaluated person |
| `weather_alert_id`| UUID | YES | FK -> `weather_alerts(alert_id)` ON DELETE SET NULL | Triggering alert |
| `rule_id` | UUID | NO | FK -> `risk_scoring_rules(rule_id)` ON DELETE RESTRICT | Versioned rule applied |
| `risk_score` | NUMERIC(5,2) | NO | CHECK (`0.00 <= risk_score <= 100.00`) | Aggregate risk score (0-100) |
| `risk_classification`| VARCHAR(20)| NO | CHECK (`LOW`, `MEDIUM`, `HIGH`) | Triage band |
| `assessment_explanation`| TEXT | NO | | Plain-text reasoning |
| `assessed_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Assessment timestamp |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Ingestion timestamp |

#### 22. `risk_assessment_factors`
Decomposition of scoring factors.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `factor_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Factor UUID |
| `assessment_id` | UUID | NO | FK -> `risk_assessments(assessment_id)` ON DELETE CASCADE | Parent assessment |
| `factor_name` | VARCHAR(100) | NO | | e.g. `HAZARD_INUNDATION_FACTOR` |
| `factor_weight` | NUMERIC(5,2) | NO | CHECK (`>= 0.0`) | Weight assigned |
| `factor_score` | NUMERIC(5,2) | NO | CHECK (`>= 0.0`) | Raw score assigned |
| `factor_detail` | JSONB | YES | | Detailed sensor/demographic inputs |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |

---

### Module 6: Emergency Case Management (`V6__create_emergency_management.sql`)

#### 23. `emergency_categories`
Categories of emergency calls.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `category_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Category UUID |
| `category_code` | VARCHAR(50) | NO | UNIQUE, CHECK (`MEDICAL_ASSISTANCE`, `EVACUATION`, `RESCUE`, `FOOD_AND_WATER`, `TRANSPORTATION`, `OTHER`) | Standardized code |
| `category_name` | VARCHAR(100) | NO | | Category name |
| `priority_weight`| INT | NO | DEFAULT `1`, CHECK (`>= 1`) | Baseline triage weight |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |

#### 24. `emergency_cases`
Distress tickets and dispatch incident cases.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `case_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Case UUID |
| `case_number` | VARCHAR(30) | NO | UNIQUE | Ticket number (e.g. `EMG-2026-0001`) |
| `reporter_id` | UUID | NO | FK -> `users(user_id)` ON DELETE RESTRICT | User reporting emergency (Protected) |
| `affected_person_id`| UUID | NO | FK -> `vulnerable_persons(person_id)` ON DELETE RESTRICT | Subject in distress (Protected) |
| `category_id` | UUID | NO | FK -> `emergency_categories(category_id)` ON DELETE RESTRICT | Emergency category |
| `weather_alert_id`| UUID | YES | FK -> `weather_alerts(alert_id)` ON DELETE SET NULL | Triggering alert |
| `description` | TEXT | NO | | Case situation description |
| `location` | GEOMETRY(Point, 4326)| NO | PostGIS Point | Spatial coordinates of incident |
| `latitude` | NUMERIC(10,8) | NO | CHECK (`-90.0 <= lat <= 90.0`) | Incident latitude |
| `longitude` | NUMERIC(11,8) | NO | CHECK (`-180.0 <= lon <= 180.0`)| Incident longitude |
| `address_details`| TEXT | YES | | Physical landmark / street |
| `priority` | VARCHAR(20) | NO | CHECK (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) | Triage priority |
| `current_status` | VARCHAR(30) | NO | DEFAULT `'REPORTED'`, CHECK (`REPORTED`, `VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) | Current ticket lifecycle status |
| `assigned_team_id`| UUID | YES | FK -> `response_teams(team_id)` ON DELETE SET NULL | Assigned operational team |
| `resolution_details`| TEXT | YES | | Detailed notes upon closure |
| `reported_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Distress call timestamp |
| `verified_at` | TIMESTAMPTZ | YES | | Dispatch verification timestamp |
| `assigned_at` | TIMESTAMPTZ | YES | | Team assignment timestamp |
| `resolved_at` | TIMESTAMPTZ | YES | | Field resolution timestamp |
| `closed_at` | TIMESTAMPTZ | YES | | Administrative closure timestamp |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Maintenance trigger |

#### 25. `emergency_case_updates`
Immutable status change history.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `update_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Update UUID |
| `case_id` | UUID | NO | FK -> `emergency_cases(case_id)` ON DELETE CASCADE | Parent case |
| `previous_status`| VARCHAR(30)| YES | | Prior status |
| `new_status` | VARCHAR(30) | NO | CHECK (`REPORTED`, `VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) | Updated status |
| `notes` | TEXT | NO | | Field or dispatcher notes |
| `updated_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | User who logged update |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Update timestamp |

#### 26. `case_assignments`
Assignment tracking connecting cases to response teams.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `assignment_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Assignment UUID |
| `case_id` | UUID | NO | FK -> `emergency_cases(case_id)` ON DELETE CASCADE | Emergency incident |
| `team_id` | UUID | NO | FK -> `response_teams(team_id)` ON DELETE RESTRICT | Dispatched team |
| `assigned_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Authority dispatcher |
| `assignment_notes`| TEXT | YES | | Dispatch directives |
| `assigned_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Dispatch time |
| `completed_at` | TIMESTAMPTZ | YES | | Team release time |
| `assignment_status`| VARCHAR(30)| NO | DEFAULT `'ACTIVE'`, CHECK (`ACTIVE`, `COMPLETED`, `REASSIGNED`, `CANCELLED`) | Assignment status |

#### 27. `case_attachments`
Incident photos, damage evidence, and medical certificates.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `attachment_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Attachment UUID |
| `case_id` | UUID | NO | FK -> `emergency_cases(case_id)` ON DELETE CASCADE | Parent case |
| `file_name` | VARCHAR(255) | NO | | Original filename |
| `file_path` | VARCHAR(500) | NO | | S3 / MinIO storage path |
| `file_type` | VARCHAR(50) | NO | | MIME type (e.g. `image/jpeg`) |
| `file_size_bytes`| BIGINT | NO | CHECK (`> 0`) | Size in bytes |
| `uploaded_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Uploader account |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Upload timestamp |

---

### Module 7: Response Team Management (`V7__create_response_team_management.sql`)

#### 28. `response_teams`
Emergency response units (NDRF, SDRF, Medical).

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `team_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Team UUID |
| `team_code` | VARCHAR(50) | NO | UNIQUE | Code (e.g. `TM-NDRF-10`) |
| `team_name` | VARCHAR(150) | NO | | Unit name |
| `team_type` | VARCHAR(50) | NO | CHECK (`NDRF`, `SDRF`, `MEDICAL_CORPS`, `FIRE_RESCUE`, `VOLUNTEER_CORPS`, `CIVIL_DEFENSE`) | Force classification |
| `contact_phone` | VARCHAR(20) | NO | | Hotline phone |
| `contact_email` | VARCHAR(255) | YES | | Unit email |
| `base_region_id`| UUID | YES | FK -> `geographical_regions(region_id)` ON DELETE SET NULL | Home base station |
| `current_availability`| VARCHAR(30)| NO | DEFAULT `'AVAILABLE'`, CHECK (`AVAILABLE`, `DEPLOYED`, `STANDBY`, `OFF_DUTY`) | Readiness status |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Maintenance trigger |

#### 29. `response_team_members`
Personnel roster per unit.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `member_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Member UUID |
| `team_id` | UUID | NO | FK -> `response_teams(team_id)` ON DELETE CASCADE | Assigned team |
| `user_id` | UUID | NO | FK -> `users(user_id)` ON DELETE RESTRICT | User account |
| `member_role` | VARCHAR(50) | NO | CHECK (`TEAM_LEADER`, `PARAMEDIC`, `RESCUE_SPECIALIST`, `DRIVER`, `DISPATCHER`) | Unit duty role |
| `joined_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Assignment date |
| `is_active` | BOOLEAN | NO | DEFAULT `TRUE` | Active membership flag |
| **UQ** | | | UNIQUE (`team_id`, `user_id`) | One role per member per team |

#### 30. `response_team_locations`
Live GPS telemetry trail.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `location_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Telemetry UUID |
| `team_id` | UUID | NO | FK -> `response_teams(team_id)` ON DELETE CASCADE | Associated unit |
| `location` | GEOMETRY(Point, 4326)| NO | PostGIS Point | Spatial coordinates |
| `latitude` | NUMERIC(10,8) | NO | CHECK (`-90.0 <= lat <= 90.0`) | Latitude |
| `longitude` | NUMERIC(11,8) | NO | CHECK (`-180.0 <= lon <= 180.0`)| Longitude |
| `speed_kmh` | NUMERIC(5,2) | YES | | Vehicle speed |
| `battery_level_percent`| INT | YES | CHECK (`0 <= batt <= 100`) | Radio / terminal battery |
| `recorded_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Timestamp |

#### 31. `team_availability`
Duty shift history.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `availability_id`| UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Shift UUID |
| `team_id` | UUID | NO | FK -> `response_teams(team_id)` ON DELETE CASCADE | Associated unit |
| `status` | VARCHAR(30) | NO | CHECK (`AVAILABLE`, `DEPLOYED`, `ON_BREAK`, `OFF_DUTY`) | Availability state |
| `effective_from`| TIMESTAMPTZ | NO | | Shift start |
| `effective_to` | TIMESTAMPTZ | YES | CHECK (`effective_to >= effective_from`) | Shift end |
| `reason_or_notes`| TEXT | YES | | Shift log remarks |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Logging timestamp |

---

### Module 8: Notification Management (`V8__create_notification_management.sql`)

#### 32. `device_tokens`
Expo and FCM mobile push tokens.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `token_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Token UUID |
| `user_id` | UUID | NO | FK -> `users(user_id)` ON DELETE CASCADE | Associated user |
| `fcm_token` | VARCHAR(500) | NO | UNIQUE | Firebase/Expo push token string |
| `device_os` | VARCHAR(20) | NO | CHECK (`ANDROID`, `IOS`, `WEB`) | Platform |
| `app_version` | VARCHAR(30) | YES | | Client application version |
| `is_active` | BOOLEAN | NO | DEFAULT `TRUE` | Active token flag |
| `last_seen_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Ping time |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Registration time |

#### 33. `notifications`
Notification dispatch intents.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `notification_id`| UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Notification UUID |
| `notification_type`| VARCHAR(50)| NO | CHECK (`PUSH`, `SMS`, `EMERGENCY_ALERT`, `WEATHER_WARNING`, `CASE_STATUS_UPDATE`) | Notification type |
| `title` | VARCHAR(255) | NO | | Notification title |
| `body` | TEXT | NO | | Notification message text |
| `payload` | JSONB | YES | | Deep-linking & client payload |
| `related_weather_alert_id`| UUID| YES | FK -> `weather_alerts(alert_id)` ON DELETE SET NULL | Correlated alert |
| `related_case_id`| UUID | YES | FK -> `emergency_cases(case_id)` ON DELETE SET NULL | Correlated emergency case |
| `created_by_user_id`| UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Initiating officer |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Issuance timestamp |

#### 34. `notification_recipients`
Multi-channel delivery status per recipient.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `recipient_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Recipient entry UUID |
| `notification_id`| UUID | NO | FK -> `notifications(notification_id)` ON DELETE CASCADE | Parent broadcast |
| `user_id` | UUID | NO | FK -> `users(user_id)` ON DELETE CASCADE | Target user |
| `phone_number` | VARCHAR(20) | YES | | Mobile number for SMS |
| `target_channel`| VARCHAR(20) | NO | CHECK (`PUSH`, `SMS`, `IN_APP`) | Channel |
| `delivery_status`| VARCHAR(30)| NO | DEFAULT `'PENDING'`, CHECK (`PENDING`, `SENT`, `DELIVERED`, `FAILED`, `BOUNCED`) | Provider-verified delivery status |
| `sent_at` | TIMESTAMPTZ | YES | | Dispatch timestamp |
| `delivered_at` | TIMESTAMPTZ | YES | | Receipt confirmation timestamp |
| `read_at` | TIMESTAMPTZ | YES | | Client read acknowledgment |
| `failure_reason`| TEXT | YES | | Provider error reason |
| `created_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Creation timestamp |
| **UQ** | | | UNIQUE (`notification_id`, `user_id`, `target_channel`) | One record per channel |

#### 35. `notification_delivery_logs`
Provider webhook delivery receipts.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `log_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Log UUID |
| `recipient_id` | UUID | NO | FK -> `notification_recipients(recipient_id)` ON DELETE CASCADE | Associated recipient dispatch |
| `provider_name`| VARCHAR(50) | NO | | e.g. `FCM`, `MSG91`, `TWILIO` |
| `provider_message_id`| VARCHAR(150)| YES| | Provider message identifier |
| `event_type` | VARCHAR(50) | NO | CHECK (`SENT`, `ACKNOWLEDGED`, `DELIVERED`, `DELIVERY_FAILED`) | Delivery event |
| `provider_response_code`| VARCHAR(50)| YES| | Response HTTP/SMS code |
| `provider_raw_response`| JSONB | YES | | Raw JSON receipt from gateway |
| `recorded_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Callback timestamp |

---

### Module 9: Audit and Security (`V9__create_audit_and_security.sql`)

#### 36. `audit_logs`
Immutable compliance audit trail.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `audit_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Audit log UUID |
| `user_id` | UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | User who took action (Protected) |
| `action` | VARCHAR(50) | NO | CHECK (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `EXPORT`, `STATUS_CHANGE`) | Action performed |
| `entity_affected`| VARCHAR(100)| NO | | Table affected |
| `entity_id` | UUID | YES | | Affected record UUID |
| `relevant_changes`| JSONB | YES | | Sanitized change diff (No PII) |
| `operation_status`| VARCHAR(20)| NO | CHECK (`SUCCESS`, `FAILURE`, `UNAUTHORIZED`) | Outcome |
| `ip_address` | VARCHAR(45) | YES | | Client IP address |
| `user_agent` | VARCHAR(255) | YES | | Client browser / device |
| `timestamp` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Audit timestamp |

#### 37. `consent_records`
Digital Personal Data Protection Act compliance tracking.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `consent_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Consent record UUID |
| `person_id` | UUID | NO | FK -> `vulnerable_persons(person_id)` ON DELETE CASCADE | Protected individual |
| `consenting_user_id`| UUID | NO | FK -> `users(user_id)` ON DELETE RESTRICT | Consenting adult / guardian |
| `consent_type` | VARCHAR(50) | NO | CHECK (`LOCATION_TRACKING`, `MEDICAL_SHARING`, `EMERGENCY_EVACUATION`, `CAREGIVER_PROXY`) | Scope of consent |
| `consent_status`| VARCHAR(30) | NO | CHECK (`GRANTED`, `WITHDRAWN`, `EXPIRED`) | Legal status |
| `consent_document_hash`| VARCHAR(128)| YES| | SHA-256 of signed terms |
| `granted_at` | TIMESTAMPTZ | NO | DEFAULT `CURRENT_TIMESTAMP` | Grant timestamp |
| `revoked_at` | TIMESTAMPTZ | YES | CHECK (`revoked_at >= granted_at`) | Revocation timestamp |
| `ip_address` | VARCHAR(45) | YES | | IP of signer |

#### 38. `access_logs`
Surveillance log recording access to sensitive dossiers.

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `access_id` | UUID | NO | PRIMARY KEY DEFAULT `gen_random_uuid()` | Log UUID |
| `user_id` | UUID | YES | FK -> `users(user_id)` ON DELETE SET NULL | Official accessing dossier |
| `accessed_person_id`| UUID | NO | FK -> `vulnerable_persons(person_id)` ON DELETE CASCADE | Inspected dossier |
| `purpose` | VARCHAR(100) | NO | CHECK (`EMERGENCY_DISPATCH`, `MEDICAL_TRIAGE`, `AUDIT`, `ROUTINE_CHECK`) | Official justification |
| `access_timestamp`| TIMESTAMPTZ| NO | DEFAULT `CURRENT_TIMESTAMP` | Access timestamp |
| `ip_address` | VARCHAR(45) | YES | | Accessing IP |
