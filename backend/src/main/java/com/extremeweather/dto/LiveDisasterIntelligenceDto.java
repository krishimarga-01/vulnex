package com.extremeweather.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public class LiveDisasterIntelligenceDto {

    private LocationInfoDto location;
    private WeatherDetailDto weather;
    private AirQualityDto airQuality;
    private ImdWarningDto districtAlert;
    private List<ForecastDayDto> forecast;
    private List<ShelterResponse> nearbyShelters;
    private List<Map<String, String>> officialHelplines;
    private String systemAttribution;
    private String dataIntegrityStatus;

    public LiveDisasterIntelligenceDto() {}

    public LocationInfoDto getLocation() { return location; }
    public void setLocation(LocationInfoDto location) { this.location = location; }

    public WeatherDetailDto getWeather() { return weather; }
    public void setWeather(WeatherDetailDto weather) { this.weather = weather; }

    public AirQualityDto getAirQuality() { return airQuality; }
    public void setAirQuality(AirQualityDto airQuality) { this.airQuality = airQuality; }

    public ImdWarningDto getDistrictAlert() { return districtAlert; }
    public void setDistrictAlert(ImdWarningDto districtAlert) { this.districtAlert = districtAlert; }

    public List<ForecastDayDto> getForecast() { return forecast; }
    public void setForecast(List<ForecastDayDto> forecast) { this.forecast = forecast; }

    public List<ShelterResponse> getNearbyShelters() { return nearbyShelters; }
    public void setNearbyShelters(List<ShelterResponse> nearbyShelters) { this.nearbyShelters = nearbyShelters; }

    public List<Map<String, String>> getOfficialHelplines() { return officialHelplines; }
    public void setOfficialHelplines(List<Map<String, String>> officialHelplines) { this.officialHelplines = officialHelplines; }

    public String getSystemAttribution() { return systemAttribution; }
    public void setSystemAttribution(String systemAttribution) { this.systemAttribution = systemAttribution; }

    public String getDataIntegrityStatus() { return dataIntegrityStatus; }
    public void setDataIntegrityStatus(String dataIntegrityStatus) { this.dataIntegrityStatus = dataIntegrityStatus; }

    public static class LocationInfoDto {
        private String state;
        private String district;
        private String locality;
        private String pincode;
        private Double latitude;
        private Double longitude;
        private boolean isGpsDetected;

        public LocationInfoDto() {}

        public LocationInfoDto(String state, String district, String locality, String pincode, Double latitude, Double longitude, boolean isGpsDetected) {
            this.state = state;
            this.district = district;
            this.locality = locality;
            this.pincode = pincode;
            this.latitude = latitude;
            this.longitude = longitude;
            this.isGpsDetected = isGpsDetected;
        }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public String getLocality() { return locality; }
        public void setLocality(String locality) { this.locality = locality; }

        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public boolean isGpsDetected() { return isGpsDetected; }
        public void setGpsDetected(boolean gpsDetected) { isGpsDetected = gpsDetected; }
    }

    public static class WeatherDetailDto {
        private Double temperature;
        private Double apparentTemperature;
        private Double humidity;
        private Double precipitationMm;
        private Double windSpeedKmh;
        private Double windDirectionDeg;
        private Double surfacePressureHpa;
        private String weatherCondition;
        private String uvIndex;
        private boolean isLive;
        private String source;
        private OffsetDateTime observationTime;
        private OffsetDateTime lastUpdated;
        private String status;

        public WeatherDetailDto() {}

        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }

        public Double getApparentTemperature() { return apparentTemperature; }
        public void setApparentTemperature(Double apparentTemperature) { this.apparentTemperature = apparentTemperature; }

        public Double getHumidity() { return humidity; }
        public void setHumidity(Double humidity) { this.humidity = humidity; }

        public Double getPrecipitationMm() { return precipitationMm; }
        public void setPrecipitationMm(Double precipitationMm) { this.precipitationMm = precipitationMm; }

        public Double getWindSpeedKmh() { return windSpeedKmh; }
        public void setWindSpeedKmh(Double windSpeedKmh) { this.windSpeedKmh = windSpeedKmh; }

        public Double getWindDirectionDeg() { return windDirectionDeg; }
        public void setWindDirectionDeg(Double windDirectionDeg) { this.windDirectionDeg = windDirectionDeg; }

        public Double getSurfacePressureHpa() { return surfacePressureHpa; }
        public void setSurfacePressureHpa(Double surfacePressureHpa) { this.surfacePressureHpa = surfacePressureHpa; }

        public String getWeatherCondition() { return weatherCondition; }
        public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }

        public String getUvIndex() { return uvIndex; }
        public void setUvIndex(String uvIndex) { this.uvIndex = uvIndex; }

        public boolean isLive() { return isLive; }
        public void setLive(boolean live) { isLive = live; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public OffsetDateTime getObservationTime() { return observationTime; }
        public void setObservationTime(OffsetDateTime observationTime) { this.observationTime = observationTime; }

        public OffsetDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(OffsetDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class AirQualityDto {
        private Integer aqi;
        private String category;
        private String categoryColor;
        private Double pm25;
        private Double pm10;
        private String source;
        private String cpcbClassificationNotice;
        private String status;

        public AirQualityDto() {}

        public Integer getAqi() { return aqi; }
        public void setAqi(Integer aqi) { this.aqi = aqi; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getCategoryColor() { return categoryColor; }
        public void setCategoryColor(String categoryColor) { this.categoryColor = categoryColor; }

        public Double getPm25() { return pm25; }
        public void setPm25(Double pm25) { this.pm25 = pm25; }

        public Double getPm10() { return pm10; }
        public void setPm10(Double pm10) { this.pm10 = pm10; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getCpcbClassificationNotice() { return cpcbClassificationNotice; }
        public void setCpcbClassificationNotice(String cpcbClassificationNotice) { this.cpcbClassificationNotice = cpcbClassificationNotice; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ForecastDayDto {
        private String dayOfWeek;
        private String dateStr;
        private Double minTemp;
        private Double maxTemp;
        private Integer rainProbability;
        private String condition;

        public ForecastDayDto() {}

        public ForecastDayDto(String dayOfWeek, String dateStr, Double minTemp, Double maxTemp, Integer rainProbability, String condition) {
            this.dayOfWeek = dayOfWeek;
            this.dateStr = dateStr;
            this.minTemp = minTemp;
            this.maxTemp = maxTemp;
            this.rainProbability = rainProbability;
            this.condition = condition;
        }

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public String getDateStr() { return dateStr; }
        public void setDateStr(String dateStr) { this.dateStr = dateStr; }

        public Double getMinTemp() { return minTemp; }
        public void setMinTemp(Double minTemp) { this.minTemp = minTemp; }

        public Double getMaxTemp() { return maxTemp; }
        public void setMaxTemp(Double maxTemp) { this.maxTemp = maxTemp; }

        public Integer getRainProbability() { return rainProbability; }
        public void setRainProbability(Integer rainProbability) { this.rainProbability = rainProbability; }

        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }
    }
}
