package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "response_teams")
public class ResponseTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "team_id", updatable = false, nullable = false)
    private UUID teamId;

    @Column(name = "team_code", nullable = false, unique = true, length = 50)
    private String teamCode;

    @Column(name = "team_name", nullable = false, length = 150)
    private String teamName;

    @Column(name = "team_type", nullable = false, length = 50)
    private String teamType;

    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_region_id")
    private GeographicalRegion baseRegion;

    @Column(name = "current_availability", nullable = false, length = 30)
    private String currentAvailability = "AVAILABLE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Transient compatibility fields for legacy controllers and services
    @Transient
    private String baseLocationName;

    @Transient
    private Integer currentCapacity = 5;

    public ResponseTeam() {}

    public ResponseTeam(UUID teamId, String teamCode, String teamName, String teamType,
                        String contactPhone, String contactEmail, GeographicalRegion baseRegion,
                        String currentAvailability) {
        this.teamId = teamId;
        this.teamCode = teamCode;
        this.teamName = teamName;
        this.teamType = teamType;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.baseRegion = baseRegion;
        this.currentAvailability = currentAvailability != null ? currentAvailability : "AVAILABLE";
    }

    // Legacy constructor compatibility
    public ResponseTeam(UUID id, String teamName, String teamType, String contactPhone,
                        String baseLocationName, Boolean isAvailable, Integer currentCapacity, Instant createdAt) {
        this.teamId = id;
        this.teamCode = "TM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        this.teamName = teamName;
        this.teamType = teamType != null ? teamType : "NDRF";
        this.contactPhone = contactPhone;
        this.baseLocationName = baseLocationName;
        this.currentAvailability = Boolean.FALSE.equals(isAvailable) ? "DEPLOYED" : "AVAILABLE";
        this.currentCapacity = currentCapacity != null ? currentCapacity : 5;
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getTeamId() { return teamId; }
    public void setTeamId(UUID teamId) { this.teamId = teamId; }

    public UUID getId() { return teamId; }
    public void setId(UUID id) { this.teamId = id; }

    public String getTeamCode() { return teamCode; }
    public void setTeamCode(String teamCode) { this.teamCode = teamCode; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getTeamType() { return teamType; }
    public void setTeamType(String teamType) { this.teamType = teamType; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public GeographicalRegion getBaseRegion() { return baseRegion; }
    public void setBaseRegion(GeographicalRegion baseRegion) { this.baseRegion = baseRegion; }

    public String getCurrentAvailability() { return currentAvailability; }
    public void setCurrentAvailability(String currentAvailability) { this.currentAvailability = currentAvailability; }

    public Boolean isAvailable() { return "AVAILABLE".equalsIgnoreCase(currentAvailability); }
    public Boolean getIsAvailable() { return "AVAILABLE".equalsIgnoreCase(currentAvailability); }
    public Boolean getAvailable() { return "AVAILABLE".equalsIgnoreCase(currentAvailability); }
    public void setIsAvailable(Boolean isAvailable) {
        this.currentAvailability = Boolean.TRUE.equals(isAvailable) ? "AVAILABLE" : "DEPLOYED";
    }

    public String getBaseLocationName() {
        if (baseLocationName != null) return baseLocationName;
        try {
            if (baseRegion != null) return baseRegion.getRegionName();
        } catch (Exception ignored) {}
        return "Disaster Ops Base";
    }
    public void setBaseLocationName(String baseLocationName) { this.baseLocationName = baseLocationName; }

    public Integer getCurrentCapacity() { return currentCapacity; }
    public void setCurrentCapacity(Integer currentCapacity) { this.currentCapacity = currentCapacity; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String teamName;
        private String teamType = "NDRF";
        private String contactPhone;
        private String baseLocationName;
        private Boolean isAvailable = true;
        private Integer currentCapacity = 5;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder teamName(String teamName) { this.teamName = teamName; return this; }
        public Builder teamType(String teamType) { this.teamType = teamType; return this; }
        public Builder contactPhone(String contactPhone) { this.contactPhone = contactPhone; return this; }
        public Builder baseLocationName(String baseLocationName) { this.baseLocationName = baseLocationName; return this; }
        public Builder isAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; return this; }
        public Builder currentCapacity(Integer currentCapacity) { this.currentCapacity = currentCapacity; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public ResponseTeam build() {
            return new ResponseTeam(id, teamName, teamType, contactPhone, baseLocationName, isAvailable, currentCapacity, createdAt);
        }
    }
}
