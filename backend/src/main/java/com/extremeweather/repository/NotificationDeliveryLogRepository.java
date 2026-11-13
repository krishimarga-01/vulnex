package com.extremeweather.repository;

import com.extremeweather.entity.DeliveryStatus;
import com.extremeweather.entity.NotificationDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationDeliveryLogRepository extends JpaRepository<NotificationDeliveryLog, UUID> {

    @Query("SELECT l FROM NotificationDeliveryLog l WHERE l.recipientId = :recipientId")
    List<NotificationDeliveryLog> findByRecipientId(@Param("recipientId") UUID recipientId);

    default List<NotificationDeliveryLog> findByNotificationId(UUID notificationId) {
        return findByRecipientId(notificationId);
    }

    default List<NotificationDeliveryLog> findByDeliveryStatus(DeliveryStatus status) {
        return List.of();
    }
}
