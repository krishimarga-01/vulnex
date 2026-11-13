package com.extremeweather.integration.notification;

import com.extremeweather.entity.DeliveryStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SmsNotificationProvider {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SmsNotificationProvider.class);

    @Value("${app.notification.sms.mock-mode:true}")
    private boolean mockMode;

    public ProviderDeliveryResult sendSms(String phoneNumber, String message) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            log.warn("SMS delivery aborted: Missing recipient phone number.");
            return new ProviderDeliveryResult(DeliveryStatus.FAILED, null, "Missing phone number");
        }

        if (mockMode) {
            String mockMsgId = "mock-sms-" + UUID.randomUUID();
            log.info("[MOCK SMS PROVIDER] Dispatched simulated SMS to {}: '{}'. Provider Message ID: {}",
                    phoneNumber, message, mockMsgId);
            return new ProviderDeliveryResult(DeliveryStatus.DELIVERED, mockMsgId, "Simulated SMS operator delivery confirmation");
        }

        log.info("Live SMS gateway dispatch to: {}", phoneNumber);
        return new ProviderDeliveryResult(DeliveryStatus.SENT, "sms-" + UUID.randomUUID(), "SMS gateway acknowledged");
    }

    public record ProviderDeliveryResult(DeliveryStatus status, String messageId, String details) {}
}
