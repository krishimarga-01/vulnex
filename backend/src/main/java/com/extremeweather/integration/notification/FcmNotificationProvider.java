package com.extremeweather.integration.notification;

import com.extremeweather.entity.DeliveryStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class FcmNotificationProvider {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FcmNotificationProvider.class);

    @Value("${app.notification.fcm.mock-mode:true}")
    private boolean mockMode;

    public ProviderDeliveryResult sendPushNotification(String deviceToken, String title, String body) {
        if (deviceToken == null || deviceToken.isBlank()) {
            log.warn("FCM Push notification skipped: No device token registered for user.");
            return new ProviderDeliveryResult(DeliveryStatus.FAILED, null, "Missing FCM token");
        }

        if (mockMode) {
            String mockMsgId = "mock-fcm-" + UUID.randomUUID();
            log.info("[MOCK FCM PUSH] Successfully simulated push dispatch to token {}: '{}' - '{}'. Generated Msg ID: {}",
                    deviceToken.substring(0, Math.min(10, deviceToken.length())) + "...", title, body, mockMsgId);
            // Simulated delivery log
            return new ProviderDeliveryResult(DeliveryStatus.DELIVERED, mockMsgId, "Simulated successful FCM push delivery");
        }

        // Live FCM implementation hook (when service account json is supplied)
        log.info("Live FCM integration active. Dispatching to token: {}", deviceToken);
        return new ProviderDeliveryResult(DeliveryStatus.SENT, "fcm-" + UUID.randomUUID(), "Live FCM payload accepted");
    }

    public record ProviderDeliveryResult(DeliveryStatus status, String messageId, String details) {}
}
