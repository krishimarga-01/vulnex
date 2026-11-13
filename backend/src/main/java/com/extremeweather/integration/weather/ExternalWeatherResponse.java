package com.extremeweather.integration.weather;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.Map;

public class ExternalWeatherResponse {

    private Double latitude;
    private Double longitude;
    private Double temperature;
    private Double feelsLike;
    private Double precipitation;
    private Double humidity;
    private Double windSpeed;
    private String weatherCondition;
    private Boolean isSimulated;
    private Instant timestamp;

    @JsonProperty("current")
    private void unpackNestedCurrent(Map<String, Object> current) {
        if (current != null) {
            if (current.get("temperature_2m") instanceof Number n) {
                this.temperature = n.doubleValue();
            }
            if (current.get("apparent_temperature") instanceof Number n) {
                this.feelsLike = n.doubleValue();
            }
            if (current.get("relative_humidity_2m") instanceof Number n) {
                this.humidity = n.doubleValue();
            }
            if (current.get("precipitation") instanceof Number n) {
                this.precipitation = n.doubleValue();
            }
            if (current.get("wind_speed_10m") instanceof Number n) {
                this.windSpeed = n.doubleValue();
            }
        }
    }

    public ExternalWeatherResponse() {}


    public ExternalWeatherResponse(Double latitude, Double longitude, Double temperature, Double feelsLike, Double precipitation, Double humidity, Double windSpeed, String weatherCondition, Boolean isSimulated, Instant timestamp) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.temperature = temperature;
        this.feelsLike = feelsLike;
        this.precipitation = precipitation;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.weatherCondition = weatherCondition;
        this.isSimulated = isSimulated;
        this.timestamp = timestamp;
    }

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
    public Boolean isSimulated() { return isSimulated; }
    public Boolean getSimulated() { return isSimulated; }
    public Boolean isIsSimulated() { return isSimulated; }
    public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Double latitude;
        private Double longitude;
        private Double temperature;
        private Double feelsLike;
        private Double precipitation;
        private Double humidity;
        private Double windSpeed;
        private String weatherCondition;
        private Boolean isSimulated;
        private Instant timestamp;
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder temperature(Double temperature) { this.temperature = temperature; return this; }
        public Builder feelsLike(Double feelsLike) { this.feelsLike = feelsLike; return this; }
        public Builder precipitation(Double precipitation) { this.precipitation = precipitation; return this; }
        public Builder humidity(Double humidity) { this.humidity = humidity; return this; }
        public Builder windSpeed(Double windSpeed) { this.windSpeed = windSpeed; return this; }
        public Builder weatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; return this; }
        public Builder isSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; return this; }
        public Builder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public ExternalWeatherResponse build() {
            return new ExternalWeatherResponse(latitude, longitude, temperature, feelsLike, precipitation, humidity, windSpeed, weatherCondition, isSimulated, timestamp);
        }
    }

}
