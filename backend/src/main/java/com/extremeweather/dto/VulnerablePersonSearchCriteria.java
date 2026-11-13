package com.extremeweather.dto;

import com.extremeweather.entity.RiskLevel;
import com.extremeweather.entity.VerificationStatus;
import com.extremeweather.entity.VulnerabilityCategory;
public class VulnerablePersonSearchCriteria {

    private VulnerabilityCategory category;
    private RiskLevel riskLevel;
    private VerificationStatus verificationStatus;
    private String searchTerm;
    private Double latitude;
    private Double longitude;
    private Double radiusKm;
    private Boolean immediateAssistanceRequired;
    private int page = 0;
    private int size = 20;

    public VulnerablePersonSearchCriteria() {}


    public VulnerablePersonSearchCriteria(VulnerabilityCategory category, RiskLevel riskLevel, VerificationStatus verificationStatus, String searchTerm, Double latitude, Double longitude, Double radiusKm, Boolean immediateAssistanceRequired, int page, int size) {
        this.category = category;
        this.riskLevel = riskLevel;
        this.verificationStatus = verificationStatus;
        this.searchTerm = searchTerm;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radiusKm = radiusKm;
        this.immediateAssistanceRequired = immediateAssistanceRequired;
        this.page = page;
        this.size = size;
    }

    public VulnerabilityCategory getCategory() { return category; }
    public void setCategory(VulnerabilityCategory category) { this.category = category; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }
    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getSearchTerm() { return searchTerm; }
    public void setSearchTerm(String searchTerm) { this.searchTerm = searchTerm; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getRadiusKm() { return radiusKm; }
    public void setRadiusKm(Double radiusKm) { this.radiusKm = radiusKm; }
    public Boolean isImmediateAssistanceRequired() { return immediateAssistanceRequired; }
    public void setImmediateAssistanceRequired(Boolean immediateAssistanceRequired) { this.immediateAssistanceRequired = immediateAssistanceRequired; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private VulnerabilityCategory category;
        private RiskLevel riskLevel;
        private VerificationStatus verificationStatus;
        private String searchTerm;
        private Double latitude;
        private Double longitude;
        private Double radiusKm;
        private Boolean immediateAssistanceRequired;
        private int page = 0;
        private int size = 20;
        public Builder category(VulnerabilityCategory category) { this.category = category; return this; }
        public Builder riskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; return this; }
        public Builder verificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; return this; }
        public Builder searchTerm(String searchTerm) { this.searchTerm = searchTerm; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder radiusKm(Double radiusKm) { this.radiusKm = radiusKm; return this; }
        public Builder immediateAssistanceRequired(Boolean immediateAssistanceRequired) { this.immediateAssistanceRequired = immediateAssistanceRequired; return this; }
        public Builder page(int page) { this.page = page; return this; }
        public Builder size(int size) { this.size = size; return this; }
        public VulnerablePersonSearchCriteria build() {
            return new VulnerablePersonSearchCriteria(category, riskLevel, verificationStatus, searchTerm, latitude, longitude, radiusKm, immediateAssistanceRequired, page, size);
        }
    }

}
