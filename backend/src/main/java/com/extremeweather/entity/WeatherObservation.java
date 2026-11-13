package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "weather_observations")
public class WeatherObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "observation_id", updatable = false, nullable = false)
    private UUID observationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "region_id", nullable = false)
    private GeographicalRegion region;

    @Column(name = "weather_provider", nullable = false, length = 100)
    private String weatherProvider = "OPEN_METEO";

    @Column(name = "source_station_id", length = 100)
    private String sourceStationId;

    @Column(name = "temperature_celsius", precision = 5, scale = 2)
    private BigDecimal temperatureCelsius;

    @Column(name = "relative_humidity_percent", precision = 5, scale = 2)
    private BigDecimal relativeHumidityPercent;

    @Column(name = "rainfall_mm", precision = 7, scale = 2)
    private BigDecimal rainfallMm;

    @Column(name = "wind_speed_kmh", precision = 6, scale = 2)
    private BigDecimal windSpeedKmh;

    @Column(name = "wind_gust_kmh", precision = 6, scale = 2)
    private BigDecimal windGustKmh;

    @Column(name = "atmospheric_pressure_hpa", precision = 7, scale = 2)
    private BigDecimal atmosphericPressureHpa;

    @Column(name = "heat_index_celsius", precision = 5, scale = 2)
    private BigDecimal heatIndexCelsius;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "raw_payload", columnDefinition = "jsonb")
    private String rawPayload;

    @Column(name = "observation_timestamp", nullable = false)
    private OffsetDateTime observationTimestamp = OffsetDateTime.now();

    @CreationTimestamp
    @Column(name = "recorded_at", nullable = false, updatable = false)
    private OffsetDateTime recordedAt;

    // Transient compatibility fields for legacy controllers and services
    @Transient
    private String regionName;

    @Transient
    private Double latitude;

    @Transient
    private Double longitude;

    @Transient
    private String weatherCondition = "CLEAR";

    @Transient
    private Boolean isSimulated = false;

    public WeatherObservation() {}

    public WeatherObservation(UUID observationId, GeographicalRegion region, String weatherProvider,
                              BigDecimal temperatureCelsius, BigDecimal relativeHumidityPercent,
                              BigDecimal rainfallMm, BigDecimal windSpeedKmh, OffsetDateTime observationTimestamp) {
        this.observationId = observationId;
        this.region = region;
        this.weatherProvider = weatherProvider != null ? weatherProvider : "OPEN_METEO";
        this.temperatureCelsius = temperatureCelsius;
        this.relativeHumidityPercent = relativeHumidityPercent;
        this.rainfallMm = rainfallMm;
        this.windSpeedKmh = windSpeedKmh;
        this.observationTimestamp = observationTimestamp != null ? observationTimestamp : OffsetDateTime.now();
    }

    // Legacy constructor compatibility
    public WeatherObservation(UUID id, GeographicalRegion region, String regionName, Double latitude,
                              Double longitude, Double temperature, Double feelsLike, Double precipitation,
                              Double humidity, Double windSpeed, String weatherCondition,
                              Boolean isSimulated, Instant observedAt) {
        this.observationId = id;
        this.region = region;
        this.regionName = regionName;
        this.latitude = latitude;
        this.longitude = longitude;
        if (temperature != null) this.temperatureCelsius = BigDecimal.valueOf(temperature);
        if (feelsLike != null) this.heatIndexCelsius = BigDecimal.valueOf(feelsLike);
        if (precipitation != null) this.rainfallMm = BigDecimal.valueOf(precipitation);
        if (humidity != null) this.relativeHumidityPercent = BigDecimal.valueOf(humidity);
        if (windSpeed != null) this.windSpeedKmh = BigDecimal.valueOf(windSpeed);
        this.weatherCondition = weatherCondition;
        this.isSimulated = isSimulated;
        this.weatherProvider = Boolean.TRUE.equals(isSimulated) ? "SIMULATOR" : "OPEN_METEO";
        if (observedAt != null) this.observationTimestamp = observedAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getObservationId() { return observationId; }
    public void setObservationId(UUID observationId) { this.observationId = observationId; }

    public UUID getId() { return observationId; }
    public void setId(UUID id) { this.observationId = id; }

    public GeographicalRegion getRegion() { return region; }
    public void setRegion(GeographicalRegion region) { this.region = region; }

    public String getWeatherProvider() { return weatherProvider; }
    public void setWeatherProvider(String weatherProvider) { this.weatherProvider = weatherProvider; }

    public String getSourceStationId() { return sourceStationId; }
    public void setSourceStationId(String sourceStationId) { this.sourceStationId = sourceStationId; }

    public BigDecimal getTemperatureCelsius() { return temperatureCelsius; }
    public void setTemperatureCelsius(BigDecimal temperatureCelsius) { this.temperatureCelsius = temperatureCelsius; }

    public BigDecimal getRelativeHumidityPercent() { return relativeHumidityPercent; }
    public void setRelativeHumidityPercent(BigDecimal relativeHumidityPercent) { this.relativeHumidityPercent = relativeHumidityPercent; }

    public BigDecimal getRainfallMm() { return rainfallMm; }
    public void setRainfallMm(BigDecimal rainfallMm) { this.rainfallMm = rainfallMm; }

    public BigDecimal getWindSpeedKmh() { return windSpeedKmh; }
    public void setWindSpeedKmh(BigDecimal windSpeedKmh) { this.windSpeedKmh = windSpeedKmh; }

    public BigDecimal getWindGustKmh() { return windGustKmh; }
    public void setWindGustKmh(BigDecimal windGustKmh) { this.windGustKmh = windGustKmh; }

    public BigDecimal getAtmosphericPressureHpa() { return atmosphericPressureHpa; }
    public void setAtmosphericPressureHpa(BigDecimal atmosphericPressureHpa) { this.atmosphericPressureHpa = atmosphericPressureHpa; }

    public BigDecimal getHeatIndexCelsius() { return heatIndexCelsius; }
    public void setHeatIndexCelsius(BigDecimal heatIndexCelsius) { this.heatIndexCelsius = heatIndexCelsius; }

    public String getRawPayload() { return rawPayload; }
    public void setRawPayload(String rawPayload) { this.rawPayload = rawPayload; }

    public OffsetDateTime getObservationTimestamp() { return observationTimestamp; }
    public void setObservationTimestamp(OffsetDateTime observationTimestamp) { this.observationTimestamp = observationTimestamp; }

    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }

    // Compatibility getters & setters
    public Double getTemperature() { return temperatureCelsius != null ? temperatureCelsius.doubleValue() : null; }
    public void setTemperature(Double temp) { if (temp != null) this.temperatureCelsius = BigDecimal.valueOf(temp); }

    public Double getFeelsLike() { return heatIndexCelsius != null ? heatIndexCelsius.doubleValue() : null; }
    public void setFeelsLike(Double feelsLike) { if (feelsLike != null) this.heatIndexCelsius = BigDecimal.valueOf(feelsLike); }

    public Double getPrecipitation() { return rainfallMm != null ? rainfallMm.doubleValue() : null; }
    public void setPrecipitation(Double precip) { if (precip != null) this.rainfallMm = BigDecimal.valueOf(precip); }

    public Double getHumidity() { return relativeHumidityPercent != null ? relativeHumidityPercent.doubleValue() : null; }
    public void setHumidity(Double hum) { if (hum != null) this.relativeHumidityPercent = BigDecimal.valueOf(hum); }

    public Double getWindSpeed() { return windSpeedKmh != null ? windSpeedKmh.doubleValue() : null; }
    public void setWindSpeed(Double ws) { if (ws != null) this.windSpeedKmh = BigDecimal.valueOf(ws); }

    public Instant getObservedAt() { return observationTimestamp != null ? observationTimestamp.toInstant() : null; }
    public void setObservedAt(Instant observedAt) {
        if (observedAt != null) this.observationTimestamp = observedAt.atOffset(ZoneOffset.UTC);
    }

    public String getRegionName() {
        if (regionName != null) return regionName;
        if (region != null) return region.getRegionName();
        return "Unknown Region";
    }
    public void setRegionName(String regionName) { this.regionName = regionName; }

    public Double getLatitude() {
        if (latitude != null) return latitude;
        if (region != null) return region.getCenterLatitude();
        return null;
    }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() {
        if (longitude != null) return longitude;
        if (region != null) return region.getCenterLongitude();
        return null;
    }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }

    public Boolean getIsSimulated() { return isSimulated; }
    public Boolean isSimulated() { return isSimulated; }
    public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private GeographicalRegion region;
        private String regionName;
        private Double latitude;
        private Double longitude;
        private Double temperature;
        private Double feelsLike;
        private Double precipitation;
        private Double humidity;
        private Double windSpeed;
        private String weatherCondition = "CLEAR";
        private Boolean isSimulated = false;
        private Instant observedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder region(GeographicalRegion region) { this.region = region; return this; }
        public Builder regionName(String regionName) { this.regionName = regionName; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder temperature(Double temperature) { this.temperature = temperature; return this; }
        public Builder feelsLike(Double feelsLike) { this.feelsLike = feelsLike; return this; }
        public Builder precipitation(Double precipitation) { this.precipitation = precipitation; return this; }
        public Builder humidity(Double humidity) { this.humidity = humidity; return this; }
        public Builder windSpeed(Double windSpeed) { this.windSpeed = windSpeed; return this; }
        public Builder weatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; return this; }
        public Builder isSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; return this; }
        public Builder observedAt(Instant observedAt) { this.observedAt = observedAt; return this; }

        public WeatherObservation build() {
            return new WeatherObservation(id, region, regionName, latitude, longitude,
                    temperature, feelsLike, precipitation, humidity, windSpeed,
                    weatherCondition, isSimulated, observedAt != null ? observedAt : Instant.now());
        }
    }
}
