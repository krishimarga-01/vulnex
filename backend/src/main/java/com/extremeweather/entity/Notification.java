package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notification_id", updatable = false, nullable = false)
    private UUID notificationId;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType = "PUSH";

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "body", columnDefinition = "TEXT", nullable = false)
    private String body;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private String payload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_weather_alert_id")
    private WeatherAlert relatedWeatherAlert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_case_id")
    private EmergencyCase relatedCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Transient compatibility fields for legacy controllers and services
    @Transient
    private User recipient;

    @Transient
    private String targetEntityType;

    @Transient
    private UUID targetEntityId;

    public Notification() {}

    public Notification(UUID notificationId, String notificationType, String title, String body,
                        String payload, WeatherAlert relatedWeatherAlert, EmergencyCase relatedCase,
                        User createdByUser) {
        this.notificationId = notificationId;
        this.notificationType = notificationType != null ? notificationType : "PUSH";
        this.title = title;
        this.body = body;
        this.payload = payload;
        this.relatedWeatherAlert = relatedWeatherAlert;
        this.relatedCase = relatedCase;
        this.createdByUser = createdByUser;
    }

    // Legacy constructor compatibility
    public Notification(UUID id, User recipient, String title, String message, String notificationType,
                        String targetEntityType, UUID targetEntityId, Instant createdAt) {
        this.notificationId = id;
        this.recipient = recipient;
        this.title = title;
        this.body = message;
        this.notificationType = notificationType != null ? notificationType : "PUSH";
        this.targetEntityType = targetEntityType;
        this.targetEntityId = targetEntityId;
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getNotificationId() { return notificationId; }
    public void setNotificationId(UUID notificationId) { this.notificationId = notificationId; }

    public UUID getId() { return notificationId; }
    public void setId(UUID id) { this.notificationId = id; }

    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getMessage() { return body; }
    public void setMessage(String message) { this.body = message; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public WeatherAlert getRelatedWeatherAlert() { return relatedWeatherAlert; }
    public void setRelatedWeatherAlert(WeatherAlert relatedWeatherAlert) { this.relatedWeatherAlert = relatedWeatherAlert; }

    public EmergencyCase getRelatedCase() { return relatedCase; }
    public void setRelatedCase(EmergencyCase relatedCase) { this.relatedCase = relatedCase; }

    public User getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(User createdByUser) { this.createdByUser = createdByUser; }

    public OffsetDateTime getCreatedAtOffset() { return createdAt; }
    public void setCreatedAtOffset(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public Instant getCreatedAt() { return createdAt != null ? createdAt.toInstant() : null; }
    public void setCreatedAt(Instant createdAt) {
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
    }

    // Compatibility getters & setters
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }

    public String getTargetEntityType() { return targetEntityType; }
    public void setTargetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; }

    public UUID getTargetEntityId() { return targetEntityId; }
    public void setTargetEntityId(UUID targetEntityId) { this.targetEntityId = targetEntityId; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private User recipient;
        private String title;
        private String message;
        private String notificationType = "PUSH";
        private String targetEntityType;
        private UUID targetEntityId;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder recipient(User recipient) { this.recipient = recipient; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder notificationType(String notificationType) { this.notificationType = notificationType; return this; }
        public Builder targetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; return this; }
        public Builder targetEntityId(UUID targetEntityId) { this.targetEntityId = targetEntityId; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public Notification build() {
            return new Notification(id, recipient, title, message, notificationType, targetEntityType, targetEntityId, createdAt);
        }
    }
}
