package com.extremeweather.integration.notification;

import com.extremeweather.entity.Notification;
import com.extremeweather.entity.NotificationDeliveryLog;
import com.extremeweather.entity.User;
import com.extremeweather.repository.NotificationDeliveryLogRepository;
import com.extremeweather.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class NotificationDispatcher {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NotificationDispatcher.class);

    private final NotificationRepository notificationRepository;
    private final NotificationDeliveryLogRepository deliveryLogRepository;
    private final FcmNotificationProvider fcmProvider;
    private final SmsNotificationProvider smsProvider;

    @Async
    @Transactional
    public void dispatchAlert(User recipient, String title, String message, String notificationType, UUID entityId) {
        if (recipient == null) return;

        // 1. Create and store high-level notification record
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .notificationType(notificationType)
                .targetEntityType("WEATHER_ALERT")
                .targetEntityId(entityId)
                .createdAt(Instant.now())
                .build();

        notification = notificationRepository.save(notification);

        // 2. Dispatch Push Notification via FCM if token present
        if (recipient.getFcmToken() != null && !recipient.getFcmToken().isBlank()) {
            FcmNotificationProvider.ProviderDeliveryResult pushResult =
                    fcmProvider.sendPushNotification(recipient.getFcmToken(), title, message);

            NotificationDeliveryLog pushLog = NotificationDeliveryLog.builder()
                    .notification(notification)
                    .channel("PUSH")
                    .destination(recipient.getFcmToken())
                    .deliveryStatus(pushResult.status())
                    .providerMessageId(pushResult.messageId())
                    .providerResponse(pushResult.details())
                    .sentAt(Instant.now())
                    .build();
            deliveryLogRepository.save(pushLog);
        }

        // 3. Dispatch SMS Notification if phone number present
        if (recipient.getPhoneNumber() != null && !recipient.getPhoneNumber().isBlank()) {
            SmsNotificationProvider.ProviderDeliveryResult smsResult =
                    smsProvider.sendSms(recipient.getPhoneNumber(), message);

            NotificationDeliveryLog smsLog = NotificationDeliveryLog.builder()
                    .notification(notification)
                    .channel("SMS")
                    .destination(recipient.getPhoneNumber())
                    .deliveryStatus(smsResult.status())
                    .providerMessageId(smsResult.messageId())
                    .providerResponse(smsResult.details())
                    .sentAt(Instant.now())
                    .build();
            deliveryLogRepository.save(smsLog);
        }

        log.info("Dispatched {} alert notification to user {} ({})",
                notificationType, recipient.getFullName(), recipient.getEmail());
    }

    public NotificationDispatcher(
            NotificationRepository notificationRepository,
            NotificationDeliveryLogRepository deliveryLogRepository,
            FcmNotificationProvider fcmProvider,
            SmsNotificationProvider smsProvider) {
        this.notificationRepository = notificationRepository;
        this.deliveryLogRepository = deliveryLogRepository;
        this.fcmProvider = fcmProvider;
        this.smsProvider = smsProvider;
    }
}
