package com.extremeweather.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ResponsePriorityPlanResponse {

    private OffsetDateTime generatedAt;
    private int activeWarningsCount;
    private List<String> affectedDistricts;
    private int totalVulnerableInAffectedZones;
    private int criticalCasesCount;
    private int availableTeamsCount;
    private List<PriorityItem> planItems;

    public static class PriorityItem {
        private int rank;
        private UUID targetPersonId;
        private String targetPersonName;
        private String vulnerabilityCategory;
        private String mobilityStatus;
        private Integer age;
        private String address;
        private String district;
        private Double latitude;
        private Double longitude;
        private boolean hasActiveSos;
        private UUID activeCaseId;
        private String activeCaseNumber;
        private String emergencyCategory;
        private String hazardName;
        private String hazardSeverity;
        private Double distanceToHazardCenterKm;
        private double priorityScore;
        private String priorityLevel; // CRITICAL_IMMEDIATE, HIGH_PRIORITY, URGENT_MONITOR
        private List<String> reasons;
        private String recommendedAction;
        private UUID recommendedTeamId;
        private String recommendedTeamName;
        private UUID assignedTeamId;
        private String assignedTeamName;
        private String status; // PENDING_APPROVAL, ASSIGNED, IN_PROGRESS, RESOLVED
        private String nearbyShelterName;
        private Double nearbyShelterDistanceKm;

        public PriorityItem() {}

        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }

        public UUID getTargetPersonId() { return targetPersonId; }
        public void setTargetPersonId(UUID targetPersonId) { this.targetPersonId = targetPersonId; }

        public String getTargetPersonName() { return targetPersonName; }
        public void setTargetPersonName(String targetPersonName) { this.targetPersonName = targetPersonName; }

        public String getVulnerabilityCategory() { return vulnerabilityCategory; }
        public void setVulnerabilityCategory(String vulnerabilityCategory) { this.vulnerabilityCategory = vulnerabilityCategory; }

        public String getMobilityStatus() { return mobilityStatus; }
        public void setMobilityStatus(String mobilityStatus) { this.mobilityStatus = mobilityStatus; }

        public Integer getAge() { return age; }
        public void setAge(Integer age) { this.age = age; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public boolean isHasActiveSos() { return hasActiveSos; }
        public void setHasActiveSos(boolean hasActiveSos) { this.hasActiveSos = hasActiveSos; }

        public UUID getActiveCaseId() { return activeCaseId; }
        public void setActiveCaseId(UUID activeCaseId) { this.activeCaseId = activeCaseId; }

        public String getActiveCaseNumber() { return activeCaseNumber; }
        public void setActiveCaseNumber(String activeCaseNumber) { this.activeCaseNumber = activeCaseNumber; }

        public String getEmergencyCategory() { return emergencyCategory; }
        public void setEmergencyCategory(String emergencyCategory) { this.emergencyCategory = emergencyCategory; }

        public String getHazardName() { return hazardName; }
        public void setHazardName(String hazardName) { this.hazardName = hazardName; }

        public String getHazardSeverity() { return hazardSeverity; }
        public void setHazardSeverity(String hazardSeverity) { this.hazardSeverity = hazardSeverity; }

        public Double getDistanceToHazardCenterKm() { return distanceToHazardCenterKm; }
        public void setDistanceToHazardCenterKm(Double distanceToHazardCenterKm) { this.distanceToHazardCenterKm = distanceToHazardCenterKm; }

        public double getPriorityScore() { return priorityScore; }
        public void setPriorityScore(double priorityScore) { this.priorityScore = priorityScore; }

        public String getPriorityLevel() { return priorityLevel; }
        public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }

        public List<String> getReasons() { return reasons; }
        public void setReasons(List<String> reasons) { this.reasons = reasons; }

        public String getRecommendedAction() { return recommendedAction; }
        public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

        public UUID getRecommendedTeamId() { return recommendedTeamId; }
        public void setRecommendedTeamId(UUID recommendedTeamId) { this.recommendedTeamId = recommendedTeamId; }

        public String getRecommendedTeamName() { return recommendedTeamName; }
        public void setRecommendedTeamName(String recommendedTeamName) { this.recommendedTeamName = recommendedTeamName; }

        public UUID getAssignedTeamId() { return assignedTeamId; }
        public void setAssignedTeamId(UUID assignedTeamId) { this.assignedTeamId = assignedTeamId; }

        public String getAssignedTeamName() { return assignedTeamName; }
        public void setAssignedTeamName(String assignedTeamName) { this.assignedTeamName = assignedTeamName; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getNearbyShelterName() { return nearbyShelterName; }
        public void setNearbyShelterName(String nearbyShelterName) { this.nearbyShelterName = nearbyShelterName; }

        public Double getNearbyShelterDistanceKm() { return nearbyShelterDistanceKm; }
        public void setNearbyShelterDistanceKm(Double nearbyShelterDistanceKm) { this.nearbyShelterDistanceKm = nearbyShelterDistanceKm; }
    }

    public ResponsePriorityPlanResponse() {}

    public OffsetDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(OffsetDateTime generatedAt) { this.generatedAt = generatedAt; }

    public int getActiveWarningsCount() { return activeWarningsCount; }
    public void setActiveWarningsCount(int activeWarningsCount) { this.activeWarningsCount = activeWarningsCount; }

    public List<String> getAffectedDistricts() { return affectedDistricts; }
    public void setAffectedDistricts(List<String> affectedDistricts) { this.affectedDistricts = affectedDistricts; }

    public int getTotalVulnerableInAffectedZones() { return totalVulnerableInAffectedZones; }
    public void setTotalVulnerableInAffectedZones(int totalVulnerableInAffectedZones) { this.totalVulnerableInAffectedZones = totalVulnerableInAffectedZones; }

    public int getCriticalCasesCount() { return criticalCasesCount; }
    public void setCriticalCasesCount(int criticalCasesCount) { this.criticalCasesCount = criticalCasesCount; }

    public int getAvailableTeamsCount() { return availableTeamsCount; }
    public void setAvailableTeamsCount(int availableTeamsCount) { this.availableTeamsCount = availableTeamsCount; }

    public List<PriorityItem> getPlanItems() { return planItems; }
    public void setPlanItems(List<PriorityItem> planItems) { this.planItems = planItems; }
}
