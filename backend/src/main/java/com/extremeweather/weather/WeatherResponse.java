package com.extremeweather.weather;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class WeatherResponse {

    private Double latitude;
    private Double longitude;
    private String timezone;
    private String locationName;
    private Instant timestamp;

    // Weather Metrics
    private Double temperature;
    private Double feelsLike;
    private Double humidity;
    private Double precipitation;
    private Double windSpeed;
    private Double windDirection;
    private Integer weatherCode;
    private String weatherCondition;
    private Double surfacePressure;

    // Air Quality Metrics (CPCB Standard)
    private Integer aqi;
    private String aqiCategory;
    private String aqiColor;
    private Double pm25;
    private Double pm10;
    private Double no2;
    private Double so2;
    private Double co;
    private Double o3;
    private String dataSource;

    // Forecasts
    private List<HourlyForecast> hourly;

    public WeatherResponse() {
        this.timestamp = Instant.now();
        this.dataSource = "Open-Meteo & Central Pollution Control Board (CPCB)";
    }

    public static class HourlyForecast {
        private String time;
        private Double temperature;
        private Integer weatherCode;
        private String condition;
        private Double precipitationProbability;
        private Double pm25;

        public HourlyForecast() {}

        public HourlyForecast(String time, Double temperature, Integer weatherCode, String condition, Double precipitationProbability, Double pm25) {
            this.time = time;
            this.temperature = temperature;
            this.weatherCode = weatherCode;
            this.condition = condition;
            this.precipitationProbability = precipitationProbability;
            this.pm25 = pm25;
        }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        public Integer getWeatherCode() { return weatherCode; }
        public void setWeatherCode(Integer weatherCode) { this.weatherCode = weatherCode; }
        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }
        public Double getPrecipitationProbability() { return precipitationProbability; }
        public void setPrecipitationProbability(Double precipitationProbability) { this.precipitationProbability = precipitationProbability; }
        public Double getPm25() { return pm25; }
        public void setPm25(Double pm25) { this.pm25 = pm25; }
    }

    // Getters and Setters
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Double getFeelsLike() { return feelsLike; }
    public void setFeelsLike(Double feelsLike) { this.feelsLike = feelsLike; }
    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }
    public Double getPrecipitation() { return precipitation; }
    public void setPrecipitation(Double precipitation) { this.precipitation = precipitation; }
    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
    public Double getWindDirection() { return windDirection; }
    public void setWindDirection(Double windDirection) { this.windDirection = windDirection; }
    public Integer getWeatherCode() { return weatherCode; }
    public void setWeatherCode(Integer weatherCode) { this.weatherCode = weatherCode; }
    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }
    public Double getSurfacePressure() { return surfacePressure; }
    public void setSurfacePressure(Double surfacePressure) { this.surfacePressure = surfacePressure; }
    public Integer getAqi() { return aqi; }
    public void setAqi(Integer aqi) { this.aqi = aqi; }
    public String getAqiCategory() { return aqiCategory; }
    public void setAqiCategory(String aqiCategory) { this.aqiCategory = aqiCategory; }
    public String getAqiColor() { return aqiColor; }
    public void setAqiColor(String aqiColor) { this.aqiColor = aqiColor; }
    public Double getPm25() { return pm25; }
    public void setPm25(Double pm25) { this.pm25 = pm25; }
    public Double getPm10() { return pm10; }
    public void setPm10(Double pm10) { this.pm10 = pm10; }
    public Double getNo2() { return no2; }
    public void setNo2(Double no2) { this.no2 = no2; }
    public Double getSo2() { return so2; }
    public void setSo2(Double so2) { this.so2 = so2; }
    public Double getCo() { return co; }
    public void setCo(Double co) { this.co = co; }
    public Double getO3() { return o3; }
    public void setO3(Double o3) { this.o3 = o3; }
    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }
    public List<HourlyForecast> getHourly() { return hourly; }
    public void setHourly(List<HourlyForecast> hourly) { this.hourly = hourly; }
}
