package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "notification_delivery_logs")
public class NotificationDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id", updatable = false, nullable = false)
    private UUID logId;

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId = UUID.randomUUID();

    @Column(name = "provider_name", nullable = false, length = 50)
    private String providerName = "FCM";

    @Column(name = "provider_message_id", length = 150)
    private String providerMessageId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType = "SENT";

    @Column(name = "provider_response_code", length = 50)
    private String providerResponseCode;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "provider_raw_response", columnDefinition = "jsonb")
    private String providerRawResponse;

    @CreationTimestamp
    @Column(name = "recorded_at", nullable = false, updatable = false)
    private OffsetDateTime recordedAt = OffsetDateTime.now();

    // Transient compatibility fields for legacy controllers and services
    @Transient
    private Notification notification;

    @Transient
    private String channel = "PUSH";

    @Transient
    private String destination;

    @Transient
    private DeliveryStatus deliveryStatus = DeliveryStatus.SENT;

    @Transient
    private Integer attemptCount = 1;

    public NotificationDeliveryLog() {}

    public NotificationDeliveryLog(UUID logId, UUID recipientId, String providerName, String providerMessageId,
                                   String eventType, String providerResponseCode, String providerRawResponse) {
        this.logId = logId;
        this.recipientId = recipientId;
        this.providerName = providerName != null ? providerName : "FCM";
        this.providerMessageId = providerMessageId;
        this.eventType = eventType != null ? eventType : "SENT";
        this.providerResponseCode = providerResponseCode;
        this.providerRawResponse = providerRawResponse;
    }

    // Legacy constructor compatibility
    public NotificationDeliveryLog(UUID id, Notification notification, String channel, String destination,
                                   DeliveryStatus deliveryStatus, Integer attemptCount,
                                   String providerResponse, String providerMessageId, Instant sentAt) {
        this.logId = id;
        this.notification = notification;
        this.channel = channel;
        this.destination = destination;
        this.deliveryStatus = deliveryStatus;
        this.attemptCount = attemptCount;
        this.providerMessageId = providerMessageId;
        this.providerName = (channel != null && channel.contains("SMS")) ? "TWILIO" : "FCM";
        this.eventType = (deliveryStatus == DeliveryStatus.FAILED) ? "DELIVERY_FAILED" : "DELIVERED";
        this.providerRawResponse = providerResponse != null && providerResponse.startsWith("{") ? providerResponse : String.format("{\"response\": \"%s\"}", providerResponse != null ? providerResponse.replace("\"", "\\\"") : "");
        if (sentAt != null) this.recordedAt = sentAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getLogId() { return logId; }
    public void setLogId(UUID logId) { this.logId = logId; }

    public UUID getId() { return logId; }
    public void setId(UUID id) { this.logId = id; }

    public UUID getRecipientId() { return recipientId; }
    public void setRecipientId(UUID recipientId) { this.recipientId = recipientId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderMessageId() { return providerMessageId; }
    public void setProviderMessageId(String providerMessageId) { this.providerMessageId = providerMessageId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getProviderResponseCode() { return providerResponseCode; }
    public void setProviderResponseCode(String providerResponseCode) { this.providerResponseCode = providerResponseCode; }

    public String getProviderRawResponse() { return providerRawResponse; }
    public void setProviderRawResponse(String providerRawResponse) { this.providerRawResponse = providerRawResponse; }

    public OffsetDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(OffsetDateTime recordedAt) { this.recordedAt = recordedAt; }

    // Compatibility getters & setters
    public Notification getNotification() { return notification; }
    public void setNotification(Notification notification) { this.notification = notification; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public Integer getAttemptCount() { return attemptCount; }
    public void setAttemptCount(Integer attemptCount) { this.attemptCount = attemptCount; }

    public String getProviderResponse() { return providerRawResponse; }
    public void setProviderResponse(String providerResponse) { this.providerRawResponse = providerResponse; }

    public Instant getSentAt() { return recordedAt != null ? recordedAt.toInstant() : null; }
    public void setSentAt(Instant sentAt) {
        if (sentAt != null) this.recordedAt = sentAt.atOffset(ZoneOffset.UTC);
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private Notification notification;
        private String channel = "PUSH";
        private String destination;
        private DeliveryStatus deliveryStatus = DeliveryStatus.SENT;
        private Integer attemptCount = 1;
        private String providerResponse;
        private String providerMessageId;
        private Instant sentAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder notification(Notification notification) { this.notification = notification; return this; }
        public Builder channel(String channel) { this.channel = channel; return this; }
        public Builder destination(String destination) { this.destination = destination; return this; }
        public Builder deliveryStatus(DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; return this; }
        public Builder attemptCount(Integer attemptCount) { this.attemptCount = attemptCount; return this; }
        public Builder providerResponse(String providerResponse) { this.providerResponse = providerResponse; return this; }
        public Builder providerMessageId(String providerMessageId) { this.providerMessageId = providerMessageId; return this; }
        public Builder sentAt(Instant sentAt) { this.sentAt = sentAt; return this; }

        public NotificationDeliveryLog build() {
            return new NotificationDeliveryLog(id, notification, channel, destination, deliveryStatus, attemptCount, providerResponse, providerMessageId, sentAt);
        }
    }
}
