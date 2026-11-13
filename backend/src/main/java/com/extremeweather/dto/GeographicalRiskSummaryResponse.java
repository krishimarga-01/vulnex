package com.extremeweather.dto;

import com.extremeweather.entity.RegionType;
import com.extremeweather.entity.RiskLevel;

import java.util.List;
import java.util.UUID;

public class GeographicalRiskSummaryResponse {

    private UUID regionId;
    private String regionName;
    private String regionCode;
    private RegionType regionType;
    private Double centerLatitude;
    private Double centerLongitude;
    private RiskLevel currentRiskLevel;
    private Integer activeAlertCount;
    private Integer totalPopulation;
    private Long vulnerableCount;
    private Long highRiskVulnerableCount;
    private String riskColor; // RED, ORANGE, GREEN
    private List<String> activeHazards;

    public GeographicalRiskSummaryResponse() {}

    public GeographicalRiskSummaryResponse(UUID regionId, String regionName, String regionCode,
                                           RegionType regionType, Double centerLatitude, Double centerLongitude,
                                           RiskLevel currentRiskLevel, Integer activeAlertCount,
                                           Integer totalPopulation, Long vulnerableCount,
                                           Long highRiskVulnerableCount, String riskColor,
                                           List<String> activeHazards) {
        this.regionId = regionId;
        this.regionName = regionName;
        this.regionCode = regionCode;
        this.regionType = regionType;
        this.centerLatitude = centerLatitude;
        this.centerLongitude = centerLongitude;
        this.currentRiskLevel = currentRiskLevel;
        this.activeAlertCount = activeAlertCount;
        this.totalPopulation = totalPopulation;
        this.vulnerableCount = vulnerableCount;
        this.highRiskVulnerableCount = highRiskVulnerableCount;
        this.riskColor = riskColor;
        this.activeHazards = activeHazards;
    }

    public UUID getRegionId() { return regionId; }
    public void setRegionId(UUID regionId) { this.regionId = regionId; }

    public String getRegionName() { return regionName; }
    public void setRegionName(String regionName) { this.regionName = regionName; }

    public String getRegionCode() { return regionCode; }
    public void setRegionCode(String regionCode) { this.regionCode = regionCode; }

    public RegionType getRegionType() { return regionType; }
    public void setRegionType(RegionType regionType) { this.regionType = regionType; }

    public Double getCenterLatitude() { return centerLatitude; }
    public void setCenterLatitude(Double centerLatitude) { this.centerLatitude = centerLatitude; }

    public Double getCenterLongitude() { return centerLongitude; }
    public void setCenterLongitude(Double centerLongitude) { this.centerLongitude = centerLongitude; }

    public RiskLevel getCurrentRiskLevel() { return currentRiskLevel; }
    public void setCurrentRiskLevel(RiskLevel currentRiskLevel) { this.currentRiskLevel = currentRiskLevel; }

    public Integer getActiveAlertCount() { return activeAlertCount; }
    public void setActiveAlertCount(Integer activeAlertCount) { this.activeAlertCount = activeAlertCount; }

    public Integer getTotalPopulation() { return totalPopulation; }
    public void setTotalPopulation(Integer totalPopulation) { this.totalPopulation = totalPopulation; }

    public Long getVulnerableCount() { return vulnerableCount; }
    public void setVulnerableCount(Long vulnerableCount) { this.vulnerableCount = vulnerableCount; }

    public Long getHighRiskVulnerableCount() { return highRiskVulnerableCount; }
    public void setHighRiskVulnerableCount(Long highRiskVulnerableCount) { this.highRiskVulnerableCount = highRiskVulnerableCount; }

    public String getRiskColor() { return riskColor; }
    public void setRiskColor(String riskColor) { this.riskColor = riskColor; }

    public List<String> getActiveHazards() { return activeHazards; }
    public void setActiveHazards(List<String> activeHazards) { this.activeHazards = activeHazards; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID regionId;
        private String regionName;
        private String regionCode;
        private RegionType regionType;
        private Double centerLatitude;
        private Double centerLongitude;
        private RiskLevel currentRiskLevel;
        private Integer activeAlertCount;
        private Integer totalPopulation;
        private Long vulnerableCount;
        private Long highRiskVulnerableCount;
        private String riskColor;
        private List<String> activeHazards;

        public Builder regionId(UUID regionId) { this.regionId = regionId; return this; }
        public Builder regionName(String regionName) { this.regionName = regionName; return this; }
        public Builder regionCode(String regionCode) { this.regionCode = regionCode; return this; }
        public Builder regionType(RegionType regionType) { this.regionType = regionType; return this; }
        public Builder centerLatitude(Double centerLatitude) { this.centerLatitude = centerLatitude; return this; }
        public Builder centerLongitude(Double centerLongitude) { this.centerLongitude = centerLongitude; return this; }
        public Builder currentRiskLevel(RiskLevel currentRiskLevel) { this.currentRiskLevel = currentRiskLevel; return this; }
        public Builder activeAlertCount(Integer activeAlertCount) { this.activeAlertCount = activeAlertCount; return this; }
        public Builder totalPopulation(Integer totalPopulation) { this.totalPopulation = totalPopulation; return this; }
        public Builder vulnerableCount(Long vulnerableCount) { this.vulnerableCount = vulnerableCount; return this; }
        public Builder highRiskVulnerableCount(Long highRiskVulnerableCount) { this.highRiskVulnerableCount = highRiskVulnerableCount; return this; }
        public Builder riskColor(String riskColor) { this.riskColor = riskColor; return this; }
        public Builder activeHazards(List<String> activeHazards) { this.activeHazards = activeHazards; return this; }

        public GeographicalRiskSummaryResponse build() {
            return new GeographicalRiskSummaryResponse(regionId, regionName, regionCode, regionType,
                    centerLatitude, centerLongitude, currentRiskLevel, activeAlertCount, totalPopulation,
                    vulnerableCount, highRiskVulnerableCount, riskColor, activeHazards);
        }
    }
}
