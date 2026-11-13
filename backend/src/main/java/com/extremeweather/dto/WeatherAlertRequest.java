package com.extremeweather.dto;

import com.extremeweather.entity.AlertType;
import com.extremeweather.entity.SeverityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class WeatherAlertRequest {

    private String alertCode;

    @NotNull(message = "Alert type is required")
    private AlertType alertType;

    @NotNull(message = "Severity level is required")
    private SeverityLevel severity;

    @NotBlank(message = "Headline is required")
    private String headline;

    @NotBlank(message = "Description is required")
    private String description;

    private String safetyInstructions;

    @NotBlank(message = "Affected region name is required")
    private String affectedRegionName;

    private String boundaryGeoJson;
    private Double centerLatitude;
    private Double centerLongitude;
    private Double radiusKm;

    @NotNull(message = "Effective from timestamp is required")
    private Instant effectiveFrom;

    @NotNull(message = "Effective until timestamp is required")
    private Instant effectiveUntil;

    public WeatherAlertRequest() {}


    public WeatherAlertRequest(String alertCode, AlertType alertType, SeverityLevel severity, String headline, String description, String safetyInstructions, String affectedRegionName, String boundaryGeoJson, Double centerLatitude, Double centerLongitude, Double radiusKm, Instant effectiveFrom, Instant effectiveUntil) {
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
    }

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

    public static Builder builder() { return new Builder(); }
    public static class Builder {
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
        public Builder effectiveUntil(Instant effectiveUntil) { this.effectiveUntil = effectiveUntil; return this; }
        public WeatherAlertRequest build() {
            return new WeatherAlertRequest(alertCode, alertType, severity, headline, description, safetyInstructions, affectedRegionName, boundaryGeoJson, centerLatitude, centerLongitude, radiusKm, effectiveFrom, effectiveUntil);
        }
    }

}
