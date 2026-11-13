-- ============================================================================
-- Migration: V4__create_weather_management.sql
-- Description: Weather observations, meteorological event types, and multi-region alerts
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: weather_event_types
-- ----------------------------------------------------------------------------
CREATE TABLE weather_event_types (
    event_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_code VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    severity_scale_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_weather_event_code UNIQUE (event_code),
    CONSTRAINT chk_weather_event_code CHECK (
        event_code IN (
            'EXTREME_HEAT',
            'HEAVY_RAINFALL',
            'FLOOD',
            'CYCLONE',
            'SEVERE_STORM'
        )
    )
);

COMMENT ON TABLE weather_event_types IS 'Master classifications of extreme meteorological threats';

-- ----------------------------------------------------------------------------
-- 2. Table: weather_observations
-- ----------------------------------------------------------------------------
CREATE TABLE weather_observations (
    observation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES geographical_regions(region_id) ON DELETE CASCADE,
    weather_provider VARCHAR(100) NOT NULL,
    source_station_id VARCHAR(100),
    temperature_celsius NUMERIC(5, 2),
    relative_humidity_percent NUMERIC(5, 2),
    rainfall_mm NUMERIC(7, 2),
    wind_speed_kmh NUMERIC(6, 2),
    wind_gust_kmh NUMERIC(6, 2),
    atmospheric_pressure_hpa NUMERIC(7, 2),
    heat_index_celsius NUMERIC(5, 2),
    raw_payload JSONB,
    observation_timestamp TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_obs_humidity CHECK (relative_humidity_percent IS NULL OR (relative_humidity_percent BETWEEN 0.0 AND 100.0)),
    CONSTRAINT chk_obs_rainfall CHECK (rainfall_mm IS NULL OR rainfall_mm >= 0.0),
    CONSTRAINT chk_obs_wind CHECK (wind_speed_kmh IS NULL OR wind_speed_kmh >= 0.0)
);

COMMENT ON TABLE weather_observations IS 'Telemetry sensor data and periodic weather observations from providers like IMD';
COMMENT ON COLUMN weather_observations.raw_payload IS 'Selective JSONB storing unparsed sensor telemetry';

-- ----------------------------------------------------------------------------
-- 3. Table: weather_alerts
-- ----------------------------------------------------------------------------
CREATE TABLE weather_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_source_id VARCHAR(100),
    event_type_id UUID NOT NULL REFERENCES weather_event_types(event_type_id) ON DELETE RESTRICT,
    alert_title VARCHAR(200) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    instruction TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    expiration_time TIMESTAMPTZ NOT NULL,
    alert_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_alert_severity CHECK (severity IN ('WARNING', 'WATCH', 'ADVISORY', 'EMERGENCY')),
    CONSTRAINT chk_alert_status CHECK (alert_status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUPERSEDED')),
    CONSTRAINT chk_alert_duration CHECK (expiration_time > start_time)
);

COMMENT ON TABLE weather_alerts IS 'Official meteorological warnings and alerts issued by meteorological departments';

CREATE TRIGGER trg_weather_alerts_updated_at
BEFORE UPDATE ON weather_alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Table: weather_alert_regions (Junction table)
-- ----------------------------------------------------------------------------
CREATE TABLE weather_alert_regions (
    alert_id UUID NOT NULL REFERENCES weather_alerts(alert_id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES geographical_regions(region_id) ON DELETE CASCADE,
    affected_severity VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (alert_id, region_id),
    CONSTRAINT chk_alert_region_sev CHECK (affected_severity IS NULL OR affected_severity IN ('YELLOW', 'ORANGE', 'RED', 'STANDARD'))
);

COMMENT ON TABLE weather_alert_regions IS 'Mapping associating one weather alert with multiple vulnerable geographical regions';
