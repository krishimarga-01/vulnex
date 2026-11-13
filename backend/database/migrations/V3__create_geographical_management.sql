-- ============================================================================
-- Migration: V3__create_geographical_management.sql
-- Description: PostGIS administrative regions, hazard zones, shelters, and capacities
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: geographical_regions
-- ----------------------------------------------------------------------------
CREATE TABLE geographical_regions (
    region_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code VARCHAR(50) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    district VARCHAR(100) NOT NULL,
    taluk VARCHAR(100),
    village_or_locality VARCHAR(100),
    boundary GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    region_risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    elevation_meters NUMERIC(8, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_regions_code UNIQUE (region_code),
    CONSTRAINT chk_regions_risk_level CHECK (region_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'SEVERE')),
    CONSTRAINT chk_region_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_region_lon CHECK (longitude BETWEEN -180.0 AND 180.0)
);

COMMENT ON TABLE geographical_regions IS 'Administrative and geographic boundaries for regional vulnerability tracking';
COMMENT ON COLUMN geographical_regions.boundary IS 'PostGIS MultiPolygon representing administrative jurisdiction boundary (WGS 84)';

CREATE TRIGGER trg_geographical_regions_updated_at
BEFORE UPDATE ON geographical_regions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Link Foreign Key: vulnerable_persons -> geographical_regions
-- ----------------------------------------------------------------------------
ALTER TABLE vulnerable_persons
ADD CONSTRAINT fk_vulnerable_persons_region
FOREIGN KEY (geographical_region_id) REFERENCES geographical_regions(region_id)
ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 2. Table: affected_zones
-- ----------------------------------------------------------------------------
CREATE TABLE affected_zones (
    zone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name VARCHAR(150) NOT NULL,
    hazard_type VARCHAR(50) NOT NULL,
    severity_level VARCHAR(20) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_zone_hazard_type CHECK (
        hazard_type IN (
            'FLOOD_INUNDATION',
            'CYCLONE_PATH',
            'HEATWAVE_CORRIDOR',
            'LANDSLIDE_PRONE'
        )
    ),
    CONSTRAINT chk_zone_severity CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_zone_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

COMMENT ON TABLE affected_zones IS 'Dynamic geospatial danger zones representing actual extreme weather footprint';
COMMENT ON COLUMN affected_zones.boundary IS 'PostGIS Polygon representing real-time hazard perimeter';

-- ----------------------------------------------------------------------------
-- 3. Table: shelters
-- ----------------------------------------------------------------------------
CREATE TABLE shelters (
    shelter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shelter_code VARCHAR(50) NOT NULL,
    shelter_name VARCHAR(150) NOT NULL,
    shelter_type VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluk VARCHAR(100),
    address TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    contact_person_name VARCHAR(150),
    contact_phone VARCHAR(20),
    is_accessible_disabled BOOLEAN NOT NULL DEFAULT TRUE,
    has_medical_facility BOOLEAN NOT NULL DEFAULT FALSE,
    has_backup_power BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shelters_code UNIQUE (shelter_code),
    CONSTRAINT chk_shelter_type CHECK (
        shelter_type IN (
            'SCHOOL',
            'COMMUNITY_HALL',
            'STADIUM',
            'HOSPITAL',
            'TEMPORARY_CAMP'
        )
    ),
    CONSTRAINT chk_shelter_status CHECK (status IN ('ACTIVE', 'FULL', 'CLOSED', 'MAINTENANCE')),
    CONSTRAINT chk_shelter_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_shelter_lon CHECK (longitude BETWEEN -180.0 AND 180.0)
);

COMMENT ON TABLE shelters IS 'Official emergency relief shelters and temporary evacuation centers';
COMMENT ON COLUMN shelters.location IS 'PostGIS Point location for shelter proximity calculation';

CREATE TRIGGER trg_shelters_updated_at
BEFORE UPDATE ON shelters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Table: shelter_capacity
-- ----------------------------------------------------------------------------
CREATE TABLE shelter_capacity (
    capacity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shelter_id UUID NOT NULL,
    total_capacity INT NOT NULL,
    current_occupancy INT NOT NULL DEFAULT 0,
    available_capacity INT GENERATED ALWAYS AS (total_capacity - current_occupancy) STORED,
    special_care_capacity INT NOT NULL DEFAULT 0,
    special_care_occupancy INT NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT uq_shelter_capacity_shelter UNIQUE (shelter_id),
    CONSTRAINT fk_shelter_capacity_shelter FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id) ON DELETE CASCADE,
    CONSTRAINT chk_capacity_positive CHECK (total_capacity >= 0),
    CONSTRAINT chk_occupancy_valid CHECK (current_occupancy >= 0 AND current_occupancy <= total_capacity),
    CONSTRAINT chk_special_care_valid CHECK (special_care_occupancy >= 0 AND special_care_occupancy <= special_care_capacity)
);

COMMENT ON TABLE shelter_capacity IS 'Real-time and managed capacity tracking for emergency shelters';
