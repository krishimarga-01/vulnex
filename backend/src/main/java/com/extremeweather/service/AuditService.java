package com.extremeweather.service;

import com.extremeweather.entity.AuditLog;
import com.extremeweather.entity.User;
import com.extremeweather.repository.AuditLogRepository;
import com.extremeweather.security.SecurityUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuditService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void logAction(String action, String resourceName, String resourceId, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(null) // Can link to user entity
                    .username(SecurityUtils.getCurrentUsername())
                    .action(action)
                    .resourceName(resourceName)
                    .resourceId(resourceId)
                    .details(details)
                    .ipAddress(ipAddress != null ? ipAddress : "INTERNAL")
                    .createdAt(Instant.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit record logged: [{}] {} on {}:{}", auditLog.getUsername(), action, resourceName, resourceId);
        } catch (Exception e) {
            log.error("Failed to persist audit log", e);
        }
    }

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

}
