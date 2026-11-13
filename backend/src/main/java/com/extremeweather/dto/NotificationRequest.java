package com.extremeweather.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class NotificationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotBlank(message = "Notification type is required")
    private String notificationType;

    private Long recipientUserId;
    private List<Long> recipientUserIds;

    // Optional targeting by region or risk level
    private String targetRegionName;
    private String targetRiskLevel;

    private String targetEntityType;
    private Long targetEntityId;

    public NotificationRequest() {}


    public NotificationRequest(String title, String message, String notificationType, Long recipientUserId, List<Long> recipientUserIds, String targetRegionName, String targetRiskLevel, String targetEntityType, Long targetEntityId) {
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
        this.recipientUserId = recipientUserId;
        this.recipientUserIds = recipientUserIds;
        this.targetRegionName = targetRegionName;
        this.targetRiskLevel = targetRiskLevel;
        this.targetEntityType = targetEntityType;
        this.targetEntityId = targetEntityId;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }
    public List<Long> getRecipientUserIds() { return recipientUserIds; }
    public void setRecipientUserIds(List<Long> recipientUserIds) { this.recipientUserIds = recipientUserIds; }
    public String getTargetRegionName() { return targetRegionName; }
    public void setTargetRegionName(String targetRegionName) { this.targetRegionName = targetRegionName; }
    public String getTargetRiskLevel() { return targetRiskLevel; }
    public void setTargetRiskLevel(String targetRiskLevel) { this.targetRiskLevel = targetRiskLevel; }
    public String getTargetEntityType() { return targetEntityType; }
    public void setTargetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; }
    public Long getTargetEntityId() { return targetEntityId; }
    public void setTargetEntityId(Long targetEntityId) { this.targetEntityId = targetEntityId; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String title;
        private String message;
        private String notificationType;
        private Long recipientUserId;
        private List<Long> recipientUserIds;
        private String targetRegionName;
        private String targetRiskLevel;
        private String targetEntityType;
        private Long targetEntityId;
        public Builder title(String title) { this.title = title; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder notificationType(String notificationType) { this.notificationType = notificationType; return this; }
        public Builder recipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; return this; }
        public Builder recipientUserIds(List<Long> recipientUserIds) { this.recipientUserIds = recipientUserIds; return this; }
        public Builder targetRegionName(String targetRegionName) { this.targetRegionName = targetRegionName; return this; }
        public Builder targetRiskLevel(String targetRiskLevel) { this.targetRiskLevel = targetRiskLevel; return this; }
        public Builder targetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; return this; }
        public Builder targetEntityId(Long targetEntityId) { this.targetEntityId = targetEntityId; return this; }
        public NotificationRequest build() {
            return new NotificationRequest(title, message, notificationType, recipientUserId, recipientUserIds, targetRegionName, targetRiskLevel, targetEntityType, targetEntityId);
        }
    }

}
