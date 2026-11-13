package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "weather_event_types")
public class WeatherEventTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "event_type_id", updatable = false, nullable = false)
    private UUID eventTypeId;

    @Column(name = "event_code", nullable = false, unique = true, length = 50)
    private String eventCode;

    @Column(name = "event_name", nullable = false, length = 100)
    private String eventName;

    @Column(name = "severity_scale_description", columnDefinition = "TEXT")
    private String severityScaleDescription;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public WeatherEventTypeEntity() {}

    public WeatherEventTypeEntity(UUID eventTypeId, String eventCode, String eventName, String severityScaleDescription) {
        this.eventTypeId = eventTypeId;
        this.eventCode = eventCode;
        this.eventName = eventName;
        this.severityScaleDescription = severityScaleDescription;
    }

    public UUID getEventTypeId() { return eventTypeId; }
    public void setEventTypeId(UUID eventTypeId) { this.eventTypeId = eventTypeId; }

    public String getEventCode() { return eventCode; }
    public void setEventCode(String eventCode) { this.eventCode = eventCode; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public String getSeverityScaleDescription() { return severityScaleDescription; }
    public void setSeverityScaleDescription(String severityScaleDescription) { this.severityScaleDescription = severityScaleDescription; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
