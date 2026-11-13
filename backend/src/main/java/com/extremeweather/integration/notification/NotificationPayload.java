package com.extremeweather.integration.notification;

import java.util.Map;

public class NotificationPayload {
    private String recipientToken;
    private String recipientPhone;
    private String title;
    private String body;
    private String notificationType;
    private Long entityId;
    private Map<String, String> data;

    public NotificationPayload() {}


    public NotificationPayload(String recipientToken, String recipientPhone, String title, String body, String notificationType, Long entityId, Map<String, String> data) {
        this.recipientToken = recipientToken;
        this.recipientPhone = recipientPhone;
        this.title = title;
        this.body = body;
        this.notificationType = notificationType;
        this.entityId = entityId;
        this.data = data;
    }

    public String getRecipientToken() { return recipientToken; }
    public void setRecipientToken(String recipientToken) { this.recipientToken = recipientToken; }
    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public Map<String, String> getData() { return data; }
    public void setData(Map<String, String> data) { this.data = data; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String recipientToken;
        private String recipientPhone;
        private String title;
        private String body;
        private String notificationType;
        private Long entityId;
        private Map<String, String> data;
        public Builder recipientToken(String recipientToken) { this.recipientToken = recipientToken; return this; }
        public Builder recipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder body(String body) { this.body = body; return this; }
        public Builder notificationType(String notificationType) { this.notificationType = notificationType; return this; }
        public Builder entityId(Long entityId) { this.entityId = entityId; return this; }
        public Builder data(Map<String, String> data) { this.data = data; return this; }
        public NotificationPayload build() {
            return new NotificationPayload(recipientToken, recipientPhone, title, body, notificationType, entityId, data);
        }
    }

}
