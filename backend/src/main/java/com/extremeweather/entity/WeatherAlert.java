package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "weather_alerts")
public class WeatherAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "alert_id", updatable = false, nullable = false)
    private UUID alertId;

    @Column(name = "external_source_id", length = 100)
    private String externalSourceId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_type_id")
    private WeatherEventTypeEntity eventType;

    @Column(name = "alert_title", nullable = false, length = 200)
    private String alertTitle;

    @Column(name = "severity", nullable = false, length = 30)
    private String severity = "WARNING";

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "instruction", columnDefinition = "TEXT")
    private String instruction;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "expiration_time", nullable = false)
    private OffsetDateTime expirationTime;

    @Column(name = "alert_status", nullable = false, length = 30)
    private String alertStatus = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Transient compatibility fields for legacy controllers and services
    @Transient
    private String alertCode;

    @Transient
    private String affectedRegionName;

    @Transient
    private String boundaryGeoJson;

    @Transient
    private Double centerLatitude;

    @Transient
    private Double centerLongitude;

    @Transient
    private Double radiusKm;

    @Transient
    private AlertType transientAlertType;

    public WeatherAlert() {}

    public WeatherAlert(UUID alertId, String externalSourceId, WeatherEventTypeEntity eventType,
                        String alertTitle, String severity, String description, String instruction,
                        OffsetDateTime startTime, OffsetDateTime expirationTime, String alertStatus,
                        User createdByUser) {
        this.alertId = alertId;
        this.externalSourceId = externalSourceId;
        this.eventType = eventType;
        this.alertTitle = alertTitle;
        this.severity = severity != null ? severity : "WARNING";
        this.description = description;
        this.instruction = instruction;
        this.startTime = startTime;
        this.expirationTime = expirationTime;
        this.alertStatus = alertStatus != null ? alertStatus : "ACTIVE";
        this.createdByUser = createdByUser;
    }

    // Legacy constructor compatibility
    public WeatherAlert(UUID id, String alertCode, AlertType alertType, SeverityLevel severity,
                        String headline, String description, String safetyInstructions,
                        String affectedRegionName, String boundaryGeoJson, Double centerLatitude,
                        Double centerLongitude, Double radiusKm, Instant effectiveFrom,
                        Instant effectiveUntil, Boolean isActive, User issuedBy, Instant createdAt) {
        this.alertId = id;
        this.alertCode = alertCode;
        this.externalSourceId = alertCode;
        this.alertTitle = headline;
        this.description = description;
        this.instruction = safetyInstructions;
        this.affectedRegionName = affectedRegionName;
        this.boundaryGeoJson = boundaryGeoJson;
        this.centerLatitude = centerLatitude;
        this.centerLongitude = centerLongitude;
        this.radiusKm = radiusKm;
        this.transientAlertType = alertType;
        this.startTime = effectiveFrom != null ? effectiveFrom.atOffset(ZoneOffset.UTC) : OffsetDateTime.now();
        this.expirationTime = effectiveUntil != null ? effectiveUntil.atOffset(ZoneOffset.UTC) : OffsetDateTime.now().plusDays(1);
        this.alertStatus = Boolean.FALSE.equals(isActive) ? "CANCELLED" : "ACTIVE";
        this.createdByUser = issuedBy;
        this.severity = severity != null ? (severity == SeverityLevel.EXTREME ? "EMERGENCY" : severity == SeverityLevel.SEVERE ? "WARNING" : "WATCH") : "WARNING";
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getAlertId() { return alertId; }
    public void setAlertId(UUID alertId) { this.alertId = alertId; }

    public UUID getId() { return alertId; }
    public void setId(UUID id) { this.alertId = id; }

    public String getExternalSourceId() { return externalSourceId; }
    public void setExternalSourceId(String externalSourceId) { this.externalSourceId = externalSourceId; }

    public WeatherEventTypeEntity getEventType() { return eventType; }
    public void setEventType(WeatherEventTypeEntity eventType) { this.eventType = eventType; }

    public String getAlertTitle() { return alertTitle; }
    public void setAlertTitle(String alertTitle) { this.alertTitle = alertTitle; }

    public String getHeadline() { return alertTitle; }
    public void setHeadline(String headline) { this.alertTitle = headline; }

    public String getSeverityString() { return severity; }
    public void setSeverityString(String severity) { this.severity = severity; }

    public SeverityLevel getSeverity() {
        if ("EMERGENCY".equalsIgnoreCase(severity)) return SeverityLevel.EXTREME;
        if ("WARNING".equalsIgnoreCase(severity)) return SeverityLevel.SEVERE;
        if ("WATCH".equalsIgnoreCase(severity)) return SeverityLevel.MODERATE;
        return SeverityLevel.MINOR;
    }
    public void setSeverity(String severity) {
        this.severity = severity != null ? severity : "WARNING";
    }

    public void setSeverity(SeverityLevel severity) {
        if (severity == SeverityLevel.EXTREME) this.severity = "EMERGENCY";
        else if (severity == SeverityLevel.SEVERE) this.severity = "WARNING";
        else if (severity == SeverityLevel.MODERATE) this.severity = "WATCH";
        else this.severity = "ADVISORY";
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInstruction() { return instruction; }
    public void setInstruction(String instruction) { this.instruction = instruction; }

    public String getSafetyInstructions() { return instruction; }
    public void setSafetyInstructions(String safetyInstructions) { this.instruction = safetyInstructions; }

    public OffsetDateTime getStartTime() { return startTime; }
    public void setStartTime(OffsetDateTime startTime) { this.startTime = startTime; }

    public OffsetDateTime getExpirationTime() { return expirationTime; }
    public void setExpirationTime(OffsetDateTime expirationTime) { this.expirationTime = expirationTime; }

    public Instant getEffectiveFrom() { return startTime != null ? startTime.toInstant() : null; }
    public void setEffectiveFrom(Instant effectiveFrom) {
        if (effectiveFrom != null) this.startTime = effectiveFrom.atOffset(ZoneOffset.UTC);
    }

    public Instant getEffectiveUntil() { return expirationTime != null ? expirationTime.toInstant() : null; }
    public void setEffectiveUntil(Instant effectiveUntil) {
        if (effectiveUntil != null) this.expirationTime = effectiveUntil.atOffset(ZoneOffset.UTC);
    }

    public String getAlertStatus() { return alertStatus; }
    public void setAlertStatus(String alertStatus) { this.alertStatus = alertStatus; }

    public Boolean getIsActive() { return "ACTIVE".equalsIgnoreCase(alertStatus); }
    public Boolean isActive() { return "ACTIVE".equalsIgnoreCase(alertStatus); }
    public void setIsActive(Boolean isActive) {
        this.alertStatus = Boolean.TRUE.equals(isActive) ? "ACTIVE" : "CANCELLED";
    }

    public User getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(User createdByUser) { this.createdByUser = createdByUser; }

    public User getIssuedBy() { return createdByUser; }
    public void setIssuedBy(User issuedBy) { this.createdByUser = issuedBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getAlertCode() { return alertCode != null ? alertCode : (externalSourceId != null ? externalSourceId : (alertId != null ? alertId.toString() : "")); }
    public void setAlertCode(String alertCode) { this.alertCode = alertCode; this.externalSourceId = alertCode; }

    public AlertType getAlertType() {
        if (eventType != null && eventType.getEventCode() != null) {
            String code = eventType.getEventCode();
            if (code.contains("HEAT")) return AlertType.HEATWAVE;
            if (code.contains("RAIN")) return AlertType.HEAVY_RAINFALL;
            if (code.contains("FLOOD")) return AlertType.FLOOD;
            if (code.contains("CYCLONE")) return AlertType.CYCLONE;
            if (code.contains("STORM")) return AlertType.SEVERE_STORM;
        }
        if (transientAlertType != null) {
            return transientAlertType;
        }
        return AlertType.HEATWAVE;
    }
    public void setAlertType(AlertType alertType) {
        this.transientAlertType = alertType;
    }

    public String getAffectedRegionName() { return affectedRegionName != null ? affectedRegionName : "Karnataka Disaster Zone"; }
    public void setAffectedRegionName(String affectedRegionName) { this.affectedRegionName = affectedRegionName; }

    public String getBoundaryGeoJson() { return boundaryGeoJson; }
    public void setBoundaryGeoJson(String boundaryGeoJson) { this.boundaryGeoJson = boundaryGeoJson; }

    public Double getCenterLatitude() { return centerLatitude; }
    public void setCenterLatitude(Double centerLatitude) { this.centerLatitude = centerLatitude; }

    public Double getCenterLongitude() { return centerLongitude; }
    public void setCenterLongitude(Double centerLongitude) { this.centerLongitude = centerLongitude; }

    public Double getRadiusKm() { return radiusKm; }
    public void setRadiusKm(Double radiusKm) { this.radiusKm = radiusKm; }

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
        private Boolean isActive = true;
        private User issuedBy;

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
        public Builder effectiveUntil(Instant effectiveUntil) { this.effectiveUntil = effectiveUntil; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public Builder issuedBy(User issuedBy) { this.issuedBy = issuedBy; return this; }

        public WeatherAlert build() {
            return new WeatherAlert(id, alertCode, alertType, severity, headline, description,
                    safetyInstructions, affectedRegionName, boundaryGeoJson, centerLatitude,
                    centerLongitude, radiusKm, effectiveFrom, effectiveUntil, isActive, issuedBy, Instant.now());
        }
    }
}
