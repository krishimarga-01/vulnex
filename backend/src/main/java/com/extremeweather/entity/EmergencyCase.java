package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "emergency_cases")
public class EmergencyCase {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "case_id", updatable = false, nullable = false)
    private UUID caseId;

    @Column(name = "case_number", nullable = false, unique = true, length = 30)
    private String caseNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "affected_person_id", nullable = false)
    private VulnerablePerson affectedPerson;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private EmergencyCategoryEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weather_alert_id")
    private WeatherAlert weatherAlert;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "location", nullable = false, columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "address_details", columnDefinition = "TEXT")
    private String addressDetails;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "HIGH";

    @Column(name = "current_status", nullable = false, length = 30)
    private String currentStatus = "REPORTED";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_team_id")
    private ResponseTeam assignedTeam;

    @Column(name = "resolution_details", columnDefinition = "TEXT")
    private String resolutionDetails;

    @Column(name = "reported_at", nullable = false)
    private OffsetDateTime reportedAt = OffsetDateTime.now();

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @Column(name = "assigned_at")
    private OffsetDateTime assignedAt;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public EmergencyCase() {}

    public EmergencyCase(UUID caseId, String caseNumber, User reporter, VulnerablePerson affectedPerson,
                         EmergencyCategoryEntity category, WeatherAlert weatherAlert, String description,
                         Point location, BigDecimal latitude, BigDecimal longitude, String addressDetails,
                         String priority, String currentStatus, ResponseTeam assignedTeam) {
        this.caseId = caseId;
        this.caseNumber = caseNumber;
        this.reporter = reporter;
        this.affectedPerson = affectedPerson;
        this.category = category;
        this.weatherAlert = weatherAlert;
        this.description = description;
        this.location = location != null ? location : (latitude != null && longitude != null ?
                GEOMETRY_FACTORY.createPoint(new Coordinate(longitude.doubleValue(), latitude.doubleValue())) : null);
        this.latitude = latitude;
        this.longitude = longitude;
        this.addressDetails = addressDetails;
        this.priority = priority != null ? priority : "HIGH";
        this.currentStatus = currentStatus != null ? currentStatus : "REPORTED";
        this.assignedTeam = assignedTeam;
    }

    // Legacy constructor compatibility
    public EmergencyCase(UUID id, String caseNumber, User reporter, VulnerablePerson affectedPerson,
                         EmergencyCategory emergencyCategory, String description, EmergencyPriority priority,
                         Double latitude, Double longitude, String address, CaseStatus status,
                         String resolutionDetails, ResponseTeam assignedTeam, Instant createdAt,
                         Instant updatedAt, Instant resolvedAt) {
        this.caseId = id;
        this.caseNumber = caseNumber;
        this.reporter = reporter;
        this.affectedPerson = affectedPerson;
        this.description = description;
        this.priority = priority != null ? priority.name() : "HIGH";
        if (latitude != null) this.latitude = BigDecimal.valueOf(latitude);
        if (longitude != null) this.longitude = BigDecimal.valueOf(longitude);
        if (latitude != null && longitude != null) {
            this.location = GEOMETRY_FACTORY.createPoint(new Coordinate(longitude, latitude));
        }
        this.addressDetails = address;
        this.currentStatus = status != null ? status.name() : "REPORTED";
        this.resolutionDetails = resolutionDetails;
        this.assignedTeam = assignedTeam;
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
        if (updatedAt != null) this.updatedAt = updatedAt.atOffset(ZoneOffset.UTC);
        if (resolvedAt != null) this.resolvedAt = resolvedAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getCaseId() { return caseId; }
    public void setCaseId(UUID caseId) { this.caseId = caseId; }

    public UUID getId() { return caseId; }
    public void setId(UUID id) { this.caseId = id; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

    public VulnerablePerson getAffectedPerson() { return affectedPerson; }
    public void setAffectedPerson(VulnerablePerson affectedPerson) { this.affectedPerson = affectedPerson; }

    public EmergencyCategoryEntity getCategory() { return category; }
    public void setCategory(EmergencyCategoryEntity category) { this.category = category; }

    public WeatherAlert getWeatherAlert() { return weatherAlert; }
    public void setWeatherAlert(WeatherAlert weatherAlert) { this.weatherAlert = weatherAlert; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }

    public BigDecimal getLatitudeValue() { return latitude; }
    public void setLatitudeValue(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitudeValue() { return longitude; }
    public void setLongitudeValue(BigDecimal longitude) { this.longitude = longitude; }

    public Double getLatitude() { return latitude != null ? latitude.doubleValue() : null; }
    public void setLatitude(Double latitude) {
        if (latitude != null) {
            this.latitude = BigDecimal.valueOf(latitude);
            if (this.longitude != null) {
                this.location = GEOMETRY_FACTORY.createPoint(new Coordinate(this.longitude.doubleValue(), latitude));
            }
        }
    }

    public Double getLongitude() { return longitude != null ? longitude.doubleValue() : null; }
    public void setLongitude(Double longitude) {
        if (longitude != null) {
            this.longitude = BigDecimal.valueOf(longitude);
            if (this.latitude != null) {
                this.location = GEOMETRY_FACTORY.createPoint(new Coordinate(longitude, this.latitude.doubleValue()));
            }
        }
    }

    public String getAddressDetails() { return addressDetails; }
    public void setAddressDetails(String addressDetails) { this.addressDetails = addressDetails; }

    public String getAddress() { return addressDetails; }
    public void setAddress(String address) { this.addressDetails = address; }

    public String getPriorityString() { return priority; }
    public void setPriorityString(String priority) { this.priority = priority; }

    public EmergencyPriority getPriority() {
        try {
            return EmergencyPriority.valueOf(priority);
        } catch (Exception e) {
            return EmergencyPriority.HIGH;
        }
    }
    public void setPriority(EmergencyPriority priority) {
        this.priority = priority != null ? priority.name() : "HIGH";
    }

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }

    public CaseStatus getStatus() {
        try {
            return CaseStatus.valueOf(currentStatus);
        } catch (Exception e) {
            return CaseStatus.REPORTED;
        }
    }
    public void setStatus(CaseStatus status) {
        this.currentStatus = status != null ? status.name() : "REPORTED";
    }

    public ResponseTeam getAssignedTeam() { return assignedTeam; }
    public void setAssignedTeam(ResponseTeam assignedTeam) { this.assignedTeam = assignedTeam; }

    public String getResolutionDetails() { return resolutionDetails; }
    public void setResolutionDetails(String resolutionDetails) { this.resolutionDetails = resolutionDetails; }

    public OffsetDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(OffsetDateTime reportedAt) { this.reportedAt = reportedAt; }

    public OffsetDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(OffsetDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public OffsetDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(OffsetDateTime assignedAt) { this.assignedAt = assignedAt; }

    public OffsetDateTime getResolvedAtOffset() { return resolvedAt; }
    public void setResolvedAtOffset(OffsetDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public Instant getResolvedAt() { return resolvedAt != null ? resolvedAt.toInstant() : null; }
    public void setResolvedAt(Instant resolvedAt) {
        if (resolvedAt != null) this.resolvedAt = resolvedAt.atOffset(ZoneOffset.UTC);
    }

    public OffsetDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(OffsetDateTime closedAt) { this.closedAt = closedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public EmergencyCategory getEmergencyCategory() {
        if (category != null && category.getCategoryCode() != null) {
            String code = category.getCategoryCode();
            if ("RESCUE".equalsIgnoreCase(code)) return EmergencyCategory.RESCUE_ASSISTANCE;
            try {
                return EmergencyCategory.valueOf(code);
            } catch (Exception ignored) {}
        }
        return EmergencyCategory.MEDICAL_ASSISTANCE;
    }
    public void setEmergencyCategory(EmergencyCategory cat) {
        // Mapped via category entity
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String caseNumber;
        private User reporter;
        private VulnerablePerson affectedPerson;
        private EmergencyCategory emergencyCategory;
        private String description;
        private EmergencyPriority priority = EmergencyPriority.HIGH;
        private Double latitude;
        private Double longitude;
        private String address;
        private CaseStatus status = CaseStatus.REPORTED;
        private String resolutionDetails;
        private ResponseTeam assignedTeam;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder caseNumber(String caseNumber) { this.caseNumber = caseNumber; return this; }
        public Builder reporter(User reporter) { this.reporter = reporter; return this; }
        public Builder affectedPerson(VulnerablePerson affectedPerson) { this.affectedPerson = affectedPerson; return this; }
        public Builder emergencyCategory(EmergencyCategory emergencyCategory) { this.emergencyCategory = emergencyCategory; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder priority(EmergencyPriority priority) { this.priority = priority; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder status(CaseStatus status) { this.status = status; return this; }
        public Builder resolutionDetails(String resolutionDetails) { this.resolutionDetails = resolutionDetails; return this; }
        public Builder assignedTeam(ResponseTeam assignedTeam) { this.assignedTeam = assignedTeam; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public EmergencyCase build() {
            return new EmergencyCase(id, caseNumber, reporter, affectedPerson, emergencyCategory,
                    description, priority, latitude, longitude, address, status,
                    resolutionDetails, assignedTeam, createdAt != null ? createdAt : Instant.now(),
                    updatedAt != null ? updatedAt : Instant.now(), null);
        }
    }
}
