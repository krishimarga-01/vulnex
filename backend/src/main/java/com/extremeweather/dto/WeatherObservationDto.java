package com.extremeweather.dto;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public class WeatherObservationDto {

    private UUID id;
    private UUID regionId;
    private String regionName;
    private Double latitude;
    private Double longitude;
    private Double temperature;
    private Double feelsLike;
    private Double precipitation;
    private Double humidity;
    private Double windSpeed;
    private String weatherCondition;
    private Boolean isSimulated;
    private Instant observedAt;

    public WeatherObservationDto() {}

    public WeatherObservationDto(UUID id, UUID regionId, String regionName, Double latitude, Double longitude, Double temperature, Double feelsLike, Double precipitation, Double humidity, Double windSpeed, String weatherCondition, Boolean isSimulated, Instant observedAt) {
        this.id = id;
        this.regionId = regionId;
        this.regionName = regionName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.temperature = temperature;
        this.feelsLike = feelsLike;
        this.precipitation = precipitation;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.weatherCondition = weatherCondition;
        this.isSimulated = isSimulated;
        this.observedAt = observedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getRegionId() { return regionId; }
    public void setRegionId(UUID regionId) { this.regionId = regionId; }

    public String getRegionName() { return regionName; }
    public void setRegionName(String regionName) { this.regionName = regionName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getFeelsLike() { return feelsLike; }
    public void setFeelsLike(Double feelsLike) { this.feelsLike = feelsLike; }

    public Double getPrecipitation() { return precipitation; }
    public void setPrecipitation(Double precipitation) { this.precipitation = precipitation; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }

    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }

    public Boolean getIsSimulated() { return isSimulated; }
    public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }

    public Instant getObservedAt() { return observedAt; }
    public void setObservedAt(Instant observedAt) { this.observedAt = observedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private UUID regionId;
        private String regionName;
        private Double latitude;
        private Double longitude;
        private Double temperature;
        private Double feelsLike;
        private Double precipitation;
        private Double humidity;
        private Double windSpeed;
        private String weatherCondition;
        private Boolean isSimulated;
        private Instant observedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder regionId(UUID regionId) { this.regionId = regionId; return this; }
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
        public Builder observedAt(OffsetDateTime observedAt) {
            this.observedAt = observedAt != null ? observedAt.toInstant() : null;
            return this;
        }

        public WeatherObservationDto build() {
            return new WeatherObservationDto(id, regionId, regionName, latitude, longitude,
                    temperature, feelsLike, precipitation, humidity, windSpeed, weatherCondition, isSimulated, observedAt);
        }
    }
}
