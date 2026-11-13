package com.extremeweather.dto;

import java.util.List;

public class IndiaDisasterMapRegionDto {
    private String id;
    private String state;
    private String district;
    private String regionName;
    private Double latitude;
    private Double longitude;
    private String alertLevel; // RED, ORANGE, YELLOW, GREEN
    private String hazardType; // CYCLONE, FLOOD, HEAVY_RAINFALL, HEATWAVE, NORMAL
    private String headline;
    private String advisory;
    private Integer affectedVulnerableCount;
    private List<String> affectedCategories;
    private String source;

    public IndiaDisasterMapRegionDto() {}

    public IndiaDisasterMapRegionDto(String id, String state, String district, String regionName,
                                     Double latitude, Double longitude, String alertLevel,
                                     String hazardType, String headline, String advisory,
                                     Integer affectedVulnerableCount, List<String> affectedCategories,
                                     String source) {
        this.id = id;
        this.state = state;
        this.district = district;
        this.regionName = regionName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.alertLevel = alertLevel;
        this.hazardType = hazardType;
        this.headline = headline;
        this.advisory = advisory;
        this.affectedVulnerableCount = affectedVulnerableCount;
        this.affectedCategories = affectedCategories;
        this.source = source;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getRegionName() { return regionName; }
    public void setRegionName(String regionName) { this.regionName = regionName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAlertLevel() { return alertLevel; }
    public void setAlertLevel(String alertLevel) { this.alertLevel = alertLevel; }

    public String getHazardType() { return hazardType; }
    public void setHazardType(String hazardType) { this.hazardType = hazardType; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getAdvisory() { return advisory; }
    public void setAdvisory(String advisory) { this.advisory = advisory; }

    public Integer getAffectedVulnerableCount() { return affectedVulnerableCount; }
    public void setAffectedVulnerableCount(Integer affectedVulnerableCount) { this.affectedVulnerableCount = affectedVulnerableCount; }

    public List<String> getAffectedCategories() { return affectedCategories; }
    public void setAffectedCategories(List<String> affectedCategories) { this.affectedCategories = affectedCategories; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
