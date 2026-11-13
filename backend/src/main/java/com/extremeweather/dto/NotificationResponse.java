package com.extremeweather.dto;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class NotificationResponse {

    private UUID id;
    private UUID recipientUserId;
    private String recipientName;
    private String title;
    private String message;
    private String notificationType;
    private Instant createdAt;
    private List<DeliveryLogDto> deliveryLogs;

    public static class DeliveryLogDto {
        private String channel;
        private String destination;
        private String deliveryStatus;
        private String providerMessageId;
        private Instant sentAt;

        public DeliveryLogDto() {}

        public DeliveryLogDto(String channel, String destination, String deliveryStatus, String providerMessageId, Instant sentAt) {
            this.channel = channel;
            this.destination = destination;
            this.deliveryStatus = deliveryStatus;
            this.providerMessageId = providerMessageId;
            this.sentAt = sentAt;
        }

        public String getChannel() { return channel; }
        public void setChannel(String channel) { this.channel = channel; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public String getDeliveryStatus() { return deliveryStatus; }
        public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
        public String getProviderMessageId() { return providerMessageId; }
        public void setProviderMessageId(String providerMessageId) { this.providerMessageId = providerMessageId; }
        public Instant getSentAt() { return sentAt; }
        public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    }

    public NotificationResponse() {}

    public NotificationResponse(UUID id, UUID recipientUserId, String recipientName, String title, String message, String notificationType, Instant createdAt, List<DeliveryLogDto> deliveryLogs) {
        this.id = id;
        this.recipientUserId = recipientUserId;
        this.recipientName = recipientName;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
        this.createdAt = createdAt;
        this.deliveryLogs = deliveryLogs;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(UUID recipientUserId) { this.recipientUserId = recipientUserId; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<DeliveryLogDto> getDeliveryLogs() { return deliveryLogs; }
    public void setDeliveryLogs(List<DeliveryLogDto> deliveryLogs) { this.deliveryLogs = deliveryLogs; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private UUID recipientUserId;
        private String recipientName;
        private String title;
        private String message;
        private String notificationType;
        private Instant createdAt;
        private List<DeliveryLogDto> deliveryLogs;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder recipientUserId(UUID recipientUserId) { this.recipientUserId = recipientUserId; return this; }
        public Builder recipientName(String recipientName) { this.recipientName = recipientName; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder notificationType(String notificationType) { this.notificationType = notificationType; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt != null ? createdAt.toInstant() : null;
            return this;
        }
        public Builder deliveryLogs(List<DeliveryLogDto> deliveryLogs) { this.deliveryLogs = deliveryLogs; return this; }

        public NotificationResponse build() {
            return new NotificationResponse(id, recipientUserId, recipientName, title, message, notificationType, createdAt, deliveryLogs);
        }
    }
}
