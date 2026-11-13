package com.extremeweather.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ImdWarningDto {

    private String externalSourceId;
    private String state;
    private String district;
    private String warningType;
    private String imdColorCode; // RED, ORANGE, YELLOW, GREEN
    private String severityLevel; // CRITICAL, SEVERE, MODERATE, LOW
    private String headline;
    private String description;
    private String safetyInstructions;
    private OffsetDateTime validFrom;
    private OffsetDateTime validUntil;
    private OffsetDateTime publishedAt;
    private String sourceUrl;
    private String status; // ACTIVE, UPDATED, EXPIRED, CANCELLED
    private int affectedVulnerableCount;
    private List<String> affectedCategories;

    public ImdWarningDto() {}

    public ImdWarningDto(String externalSourceId, String state, String district, String warningType,
                         String imdColorCode, String severityLevel, String headline, String description,
                         String safetyInstructions, OffsetDateTime validFrom, OffsetDateTime validUntil,
                         OffsetDateTime publishedAt, String sourceUrl, String status,
                         int affectedVulnerableCount, List<String> affectedCategories) {
        this.externalSourceId = externalSourceId;
        this.state = state;
        this.district = district;
        this.warningType = warningType;
        this.imdColorCode = imdColorCode;
        this.severityLevel = severityLevel;
        this.headline = headline;
        this.description = description;
        this.safetyInstructions = safetyInstructions;
        this.validFrom = validFrom;
        this.validUntil = validUntil;
        this.publishedAt = publishedAt;
        this.sourceUrl = sourceUrl;
        this.status = status;
        this.affectedVulnerableCount = affectedVulnerableCount;
        this.affectedCategories = affectedCategories;
    }

    public String getExternalSourceId() { return externalSourceId; }
    public void setExternalSourceId(String externalSourceId) { this.externalSourceId = externalSourceId; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getWarningType() { return warningType; }
    public void setWarningType(String warningType) { this.warningType = warningType; }

    public String getImdColorCode() { return imdColorCode; }
    public void setImdColorCode(String imdColorCode) { this.imdColorCode = imdColorCode; }

    public String getSeverityLevel() { return severityLevel; }
    public void setSeverityLevel(String severityLevel) { this.severityLevel = severityLevel; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSafetyInstructions() { return safetyInstructions; }
    public void setSafetyInstructions(String safetyInstructions) { this.safetyInstructions = safetyInstructions; }

    public OffsetDateTime getValidFrom() { return validFrom; }
    public void setValidFrom(OffsetDateTime validFrom) { this.validFrom = validFrom; }

    public OffsetDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(OffsetDateTime validUntil) { this.validUntil = validUntil; }

    public OffsetDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(OffsetDateTime publishedAt) { this.publishedAt = publishedAt; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getAffectedVulnerableCount() { return affectedVulnerableCount; }
    public void setAffectedVulnerableCount(int affectedVulnerableCount) { this.affectedVulnerableCount = affectedVulnerableCount; }

    public List<String> getAffectedCategories() { return affectedCategories; }
    public void setAffectedCategories(List<String> affectedCategories) { this.affectedCategories = affectedCategories; }
}
