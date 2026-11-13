package com.extremeweather.dto;

import com.extremeweather.entity.CaseStatus;
import com.extremeweather.entity.EmergencyCategory;
import com.extremeweather.entity.EmergencyPriority;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public class EmergencyCaseResponse {

    private UUID id;
    private String caseNumber;
    private UUID reporterUserId;
    private String reporterFullName;
    private String reporterPhone;
    private UUID affectedPersonId;
    private String affectedPersonName;
    private EmergencyCategory emergencyCategory;
    private String description;
    private EmergencyPriority priority;
    private Double latitude;
    private Double longitude;
    private String address;
    private CaseStatus status;
    private String resolutionDetails;
    private UUID assignedTeamId;
    private String assignedTeamName;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;

    public EmergencyCaseResponse() {}

    public EmergencyCaseResponse(UUID id, String caseNumber, UUID reporterUserId, String reporterFullName,
                                 String reporterPhone, UUID affectedPersonId, String affectedPersonName,
                                 EmergencyCategory emergencyCategory, String description,
                                 EmergencyPriority priority, Double latitude, Double longitude,
                                 String address, CaseStatus status, String resolutionDetails,
                                 UUID assignedTeamId, String assignedTeamName, Instant createdAt,
                                 Instant updatedAt, Instant resolvedAt) {
        this.id = id;
        this.caseNumber = caseNumber;
        this.reporterUserId = reporterUserId;
        this.reporterFullName = reporterFullName;
        this.reporterPhone = reporterPhone;
        this.affectedPersonId = affectedPersonId;
        this.affectedPersonName = affectedPersonName;
        this.emergencyCategory = emergencyCategory;
        this.description = description;
        this.priority = priority;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.status = status;
        this.resolutionDetails = resolutionDetails;
        this.assignedTeamId = assignedTeamId;
        this.assignedTeamName = assignedTeamName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resolvedAt = resolvedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public UUID getReporterUserId() { return reporterUserId; }
    public void setReporterUserId(UUID reporterUserId) { this.reporterUserId = reporterUserId; }

    public String getReporterFullName() { return reporterFullName; }
    public void setReporterFullName(String reporterFullName) { this.reporterFullName = reporterFullName; }

    public String getReporterPhone() { return reporterPhone; }
    public void setReporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; }

    public UUID getAffectedPersonId() { return affectedPersonId; }
    public void setAffectedPersonId(UUID affectedPersonId) { this.affectedPersonId = affectedPersonId; }

    public String getAffectedPersonName() { return affectedPersonName; }
    public void setAffectedPersonName(String affectedPersonName) { this.affectedPersonName = affectedPersonName; }

    public EmergencyCategory getEmergencyCategory() { return emergencyCategory; }
    public void setEmergencyCategory(EmergencyCategory emergencyCategory) { this.emergencyCategory = emergencyCategory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EmergencyPriority getPriority() { return priority; }
    public void setPriority(EmergencyPriority priority) { this.priority = priority; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public CaseStatus getStatus() { return status; }
    public void setStatus(CaseStatus status) { this.status = status; }

    public String getResolutionDetails() { return resolutionDetails; }
    public void setResolutionDetails(String resolutionDetails) { this.resolutionDetails = resolutionDetails; }

    public UUID getAssignedTeamId() { return assignedTeamId; }
    public void setAssignedTeamId(UUID assignedTeamId) { this.assignedTeamId = assignedTeamId; }

    public String getAssignedTeamName() { return assignedTeamName; }
    public void setAssignedTeamName(String assignedTeamName) { this.assignedTeamName = assignedTeamName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String caseNumber;
        private UUID reporterUserId;
        private String reporterFullName;
        private String reporterPhone;
        private UUID affectedPersonId;
        private String affectedPersonName;
        private EmergencyCategory emergencyCategory;
        private String description;
        private EmergencyPriority priority;
        private Double latitude;
        private Double longitude;
        private String address;
        private CaseStatus status;
        private String resolutionDetails;
        private UUID assignedTeamId;
        private String assignedTeamName;
        private Instant createdAt;
        private Instant updatedAt;
        private Instant resolvedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder caseNumber(String caseNumber) { this.caseNumber = caseNumber; return this; }
        public Builder reporterUserId(UUID reporterUserId) { this.reporterUserId = reporterUserId; return this; }
        public Builder reporterFullName(String reporterFullName) { this.reporterFullName = reporterFullName; return this; }
        public Builder reporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; return this; }
        public Builder affectedPersonId(UUID affectedPersonId) { this.affectedPersonId = affectedPersonId; return this; }
        public Builder affectedPersonName(String affectedPersonName) { this.affectedPersonName = affectedPersonName; return this; }
        public Builder emergencyCategory(EmergencyCategory emergencyCategory) { this.emergencyCategory = emergencyCategory; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder priority(EmergencyPriority priority) { this.priority = priority; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder status(CaseStatus status) { this.status = status; return this; }
        public Builder resolutionDetails(String resolutionDetails) { this.resolutionDetails = resolutionDetails; return this; }
        public Builder assignedTeamId(UUID assignedTeamId) { this.assignedTeamId = assignedTeamId; return this; }
        public Builder assignedTeamName(String assignedTeamName) { this.assignedTeamName = assignedTeamName; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt != null ? createdAt.toInstant() : null;
            return this;
        }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder updatedAt(OffsetDateTime updatedAt) {
            this.updatedAt = updatedAt != null ? updatedAt.toInstant() : null;
            return this;
        }
        public Builder resolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; return this; }
        public Builder resolvedAt(OffsetDateTime resolvedAt) {
            this.resolvedAt = resolvedAt != null ? resolvedAt.toInstant() : null;
            return this;
        }

        public EmergencyCaseResponse build() {
            return new EmergencyCaseResponse(id, caseNumber, reporterUserId, reporterFullName, reporterPhone,
                    affectedPersonId, affectedPersonName, emergencyCategory, description, priority,
                    latitude, longitude, address, status, resolutionDetails, assignedTeamId,
                    assignedTeamName, createdAt, updatedAt, resolvedAt);
        }
    }
}
