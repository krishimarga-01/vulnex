package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "audit_id", updatable = false, nullable = false)
    private UUID auditId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "entity_affected", nullable = false, length = 100)
    private String entityAffected;

    @Column(name = "entity_id")
    private UUID entityId;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "relevant_changes", columnDefinition = "jsonb")
    private String relevantChanges;

    @Column(name = "operation_status", nullable = false, length = 20)
    private String operationStatus = "SUCCESS";

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false, updatable = false)
    private OffsetDateTime timestamp = OffsetDateTime.now();

    // Transient compatibility fields for legacy controllers and services
    @Transient
    private String username;

    public AuditLog() {}

    public AuditLog(UUID auditId, User user, String action, String entityAffected, UUID entityId,
                    String relevantChanges, String operationStatus, String ipAddress, String userAgent) {
        this.auditId = auditId;
        this.user = user;
        this.action = action;
        this.entityAffected = entityAffected;
        this.entityId = entityId;
        this.relevantChanges = relevantChanges;
        this.operationStatus = operationStatus != null ? operationStatus : "SUCCESS";
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }

    // Legacy constructor compatibility
    public AuditLog(UUID id, User user, String username, String action, String resourceName,
                    String resourceId, String details, String ipAddress, Instant createdAt) {
        this.auditId = id;
        this.user = user;
        this.username = username;
        this.action = (action != null && (action.equals("CREATE") || action.equals("UPDATE") || action.equals("DELETE") || action.equals("LOGIN") || action.equals("LOGOUT") || action.equals("EXPORT") || action.equals("STATUS_CHANGE"))) ? action : "UPDATE";
        this.entityAffected = resourceName != null ? resourceName : "GENERAL";
        try {
            if (resourceId != null) this.entityId = UUID.fromString(resourceId);
        } catch (Exception ignored) {}
        this.relevantChanges = details != null && details.startsWith("{") ? details : String.format("{\"details\": \"%s\"}", details != null ? details.replace("\"", "\\\"") : "");
        this.ipAddress = ipAddress;
        this.operationStatus = "SUCCESS";
        if (createdAt != null) this.timestamp = createdAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getAuditId() { return auditId; }
    public void setAuditId(UUID auditId) { this.auditId = auditId; }

    public UUID getId() { return auditId; }
    public void setId(UUID id) { this.auditId = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityAffected() { return entityAffected; }
    public void setEntityAffected(String entityAffected) { this.entityAffected = entityAffected; }

    public String getResourceName() { return entityAffected; }
    public void setResourceName(String resourceName) { this.entityAffected = resourceName; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public String getResourceId() { return entityId != null ? entityId.toString() : null; }
    public void setResourceId(String resourceId) {
        try {
            if (resourceId != null) this.entityId = UUID.fromString(resourceId);
        } catch (Exception ignored) {}
    }

    public String getRelevantChanges() { return relevantChanges; }
    public void setRelevantChanges(String relevantChanges) { this.relevantChanges = relevantChanges; }

    public String getDetails() { return relevantChanges; }
    public void setDetails(String details) { this.relevantChanges = details; }

    public String getOperationStatus() { return operationStatus; }
    public void setOperationStatus(String operationStatus) { this.operationStatus = operationStatus; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public Instant getCreatedAt() { return timestamp != null ? timestamp.toInstant() : null; }
    public void setCreatedAt(Instant createdAt) {
        if (createdAt != null) this.timestamp = createdAt.atOffset(ZoneOffset.UTC);
    }

    public String getUsername() {
        if (username != null) return username;
        if (user != null) return user.getEmail();
        return "system";
    }
    public void setUsername(String username) { this.username = username; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private User user;
        private String username;
        private String action;
        private String resourceName;
        private String resourceId;
        private String details;
        private String ipAddress;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder action(String action) { this.action = action; return this; }
        public Builder resourceName(String resourceName) { this.resourceName = resourceName; return this; }
        public Builder resourceId(String resourceId) { this.resourceId = resourceId; return this; }
        public Builder details(String details) { this.details = details; return this; }
        public Builder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public AuditLog build() {
            return new AuditLog(id, user, username, action, resourceName, resourceId, details, ipAddress, createdAt);
        }
    }
}
