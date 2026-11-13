package com.extremeweather.dto;

import com.extremeweather.entity.AlertType;
import com.extremeweather.entity.SeverityLevel;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public class WeatherAlertResponse {

    private UUID id;
    private String alertCode;
    private AlertType alertType;
    private SeverityLevel severity;
    private String headline;
    private String description;
    private String safetyInstructions;
    private String affectedRegionName;
    private String boundaryGeoJson;
    private Double centerLatitude;
    private Double centerLongitude;
    private Double radiusKm;
    private Instant effectiveFrom;
    private Instant effectiveUntil;
    private Boolean isActive;
    private UUID issuedByUserId;
    private String issuedByUsername;
    private Instant createdAt;

    public WeatherAlertResponse() {}

    public WeatherAlertResponse(UUID id, String alertCode, AlertType alertType, SeverityLevel severity, String headline, String description, String safetyInstructions, String affectedRegionName, String boundaryGeoJson, Double centerLatitude, Double centerLongitude, Double radiusKm, Instant effectiveFrom, Instant effectiveUntil, Boolean isActive, UUID issuedByUserId, String issuedByUsername, Instant createdAt) {
        this.id = id;
        this.alertCode = alertCode;
        this.alertType = alertType;
        this.severity = severity;
        this.headline = headline;
        this.description = description;
        this.safetyInstructions = safetyInstructions;
        this.affectedRegionName = affectedRegionName;
        this.boundaryGeoJson = boundaryGeoJson;
        this.centerLatitude = centerLatitude;
        this.centerLongitude = centerLongitude;
        this.radiusKm = radiusKm;
        this.effectiveFrom = effectiveFrom;
        this.effectiveUntil = effectiveUntil;
        this.isActive = isActive;
        this.issuedByUserId = issuedByUserId;
        this.issuedByUsername = issuedByUsername;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAlertCode() { return alertCode; }
    public void setAlertCode(String alertCode) { this.alertCode = alertCode; }

    public AlertType getAlertType() { return alertType; }
    public void setAlertType(AlertType alertType) { this.alertType = alertType; }

    public SeverityLevel getSeverity() { return severity; }
    public void setSeverity(SeverityLevel severity) { this.severity = severity; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSafetyInstructions() { return safetyInstructions; }
    public void setSafetyInstructions(String safetyInstructions) { this.safetyInstructions = safetyInstructions; }

    public String getAffectedRegionName() { return affectedRegionName; }
    public void setAffectedRegionName(String affectedRegionName) { this.affectedRegionName = affectedRegionName; }

    public String getBoundaryGeoJson() { return boundaryGeoJson; }
    public void setBoundaryGeoJson(String boundaryGeoJson) { this.boundaryGeoJson = boundaryGeoJson; }

    public Double getCenterLatitude() { return centerLatitude; }
    public void setCenterLatitude(Double centerLatitude) { this.centerLatitude = centerLatitude; }

    public Double getCenterLongitude() { return centerLongitude; }
    public void setCenterLongitude(Double centerLongitude) { this.centerLongitude = centerLongitude; }

    public Double getRadiusKm() { return radiusKm; }
    public void setRadiusKm(Double radiusKm) { this.radiusKm = radiusKm; }

    public Instant getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(Instant effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public Instant getEffectiveUntil() { return effectiveUntil; }
    public void setEffectiveUntil(Instant effectiveUntil) { this.effectiveUntil = effectiveUntil; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public UUID getIssuedByUserId() { return issuedByUserId; }
    public void setIssuedByUserId(UUID issuedByUserId) { this.issuedByUserId = issuedByUserId; }

    public String getIssuedByUsername() { return issuedByUsername; }
    public void setIssuedByUsername(String issuedByUsername) { this.issuedByUsername = issuedByUsername; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String alertCode;
        private AlertType alertType;
        private SeverityLevel severity;
        private String headline;
        private String description;
        private String safetyInstructions;
        private String affectedRegionName;
        private String boundaryGeoJson;
        private Double centerLatitude;
        private Double centerLongitude;
        private Double radiusKm;
        private Instant effectiveFrom;
        private Instant effectiveUntil;
        private Boolean isActive;
        private UUID issuedByUserId;
        private String issuedByUsername;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder alertCode(String alertCode) { this.alertCode = alertCode; return this; }
        public Builder alertType(AlertType alertType) { this.alertType = alertType; return this; }
        public Builder severity(SeverityLevel severity) { this.severity = severity; return this; }
        public Builder headline(String headline) { this.headline = headline; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder safetyInstructions(String safetyInstructions) { this.safetyInstructions = safetyInstructions; return this; }
        public Builder affectedRegionName(String affectedRegionName) { this.affectedRegionName = affectedRegionName; return this; }
        public Builder boundaryGeoJson(String boundaryGeoJson) { this.boundaryGeoJson = boundaryGeoJson; return this; }
        public Builder centerLatitude(Double centerLatitude) { this.centerLatitude = centerLatitude; return this; }
        public Builder centerLongitude(Double centerLongitude) { this.centerLongitude = centerLongitude; return this; }
        public Builder radiusKm(Double radiusKm) { this.radiusKm = radiusKm; return this; }
        public Builder effectiveFrom(Instant effectiveFrom) { this.effectiveFrom = effectiveFrom; return this; }
        public Builder effectiveFrom(OffsetDateTime effectiveFrom) {
            this.effectiveFrom = effectiveFrom != null ? effectiveFrom.toInstant() : null;
            return this;
        }
        public Builder effectiveUntil(Instant effectiveUntil) { this.effectiveUntil = effectiveUntil; return this; }
        public Builder effectiveUntil(OffsetDateTime effectiveUntil) {
            this.effectiveUntil = effectiveUntil != null ? effectiveUntil.toInstant() : null;
            return this;
        }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public Builder issuedByUserId(UUID issuedByUserId) { this.issuedByUserId = issuedByUserId; return this; }
        public Builder issuedByUsername(String issuedByUsername) { this.issuedByUsername = issuedByUsername; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt != null ? createdAt.toInstant() : null;
            return this;
        }

        public WeatherAlertResponse build() {
            return new WeatherAlertResponse(id, alertCode, alertType, severity, headline, description,
                    safetyInstructions, affectedRegionName, boundaryGeoJson, centerLatitude, centerLongitude,
                    radiusKm, effectiveFrom, effectiveUntil, isActive, issuedByUserId, issuedByUsername, createdAt);
        }
    }
}
