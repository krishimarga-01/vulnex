package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "caregiver_relationships", uniqueConstraints = {
    @UniqueConstraint(name = "uq_caregiver_person", columnNames = {"caregiver_user_id", "person_id"})
})
public class CaregiverRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "relationship_id", updatable = false, nullable = false)
    private UUID relationshipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caregiver_user_id", nullable = false)
    private User caregiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private VulnerablePerson vulnerablePerson;

    @Column(name = "relationship_type", nullable = false, length = 50)
    private String relationshipType = "GUARDIAN";

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = true;

    @Column(name = "emergency_authorization", nullable = false)
    private Boolean emergencyAuthorization = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public CaregiverRelationship() {}

    public CaregiverRelationship(UUID relationshipId, User caregiver, VulnerablePerson vulnerablePerson,
                                 String relationshipType, Boolean isPrimary, Boolean emergencyAuthorization) {
        this.relationshipId = relationshipId;
        this.caregiver = caregiver;
        this.vulnerablePerson = vulnerablePerson;
        this.relationshipType = relationshipType != null ? relationshipType : "GUARDIAN";
        this.isPrimary = isPrimary != null ? isPrimary : true;
        this.emergencyAuthorization = emergencyAuthorization != null ? emergencyAuthorization : true;
    }

    // Legacy constructor compatibility
    public CaregiverRelationship(UUID id, User caregiver, VulnerablePerson vulnerablePerson,
                                 String relationshipType, Boolean isPrimary, Boolean verified, Instant createdAt) {
        this.relationshipId = id;
        this.caregiver = caregiver;
        this.vulnerablePerson = vulnerablePerson;
        this.relationshipType = relationshipType != null ? relationshipType : "GUARDIAN";
        this.isPrimary = isPrimary != null ? isPrimary : true;
        this.emergencyAuthorization = verified != null ? verified : true;
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getRelationshipId() { return relationshipId; }
    public void setRelationshipId(UUID relationshipId) { this.relationshipId = relationshipId; }

    public UUID getId() { return relationshipId; }
    public void setId(UUID id) { this.relationshipId = id; }

    public User getCaregiver() { return caregiver; }
    public void setCaregiver(User caregiver) { this.caregiver = caregiver; }

    public VulnerablePerson getVulnerablePerson() { return vulnerablePerson; }
    public void setVulnerablePerson(VulnerablePerson vulnerablePerson) { this.vulnerablePerson = vulnerablePerson; }

    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }

    public Boolean getIsPrimary() { return isPrimary; }
    public Boolean isPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public Boolean getEmergencyAuthorization() { return emergencyAuthorization; }
    public void setEmergencyAuthorization(Boolean emergencyAuthorization) { this.emergencyAuthorization = emergencyAuthorization; }

    public Boolean isVerified() { return emergencyAuthorization; }
    public void setVerified(Boolean verified) { this.emergencyAuthorization = verified; }

    public OffsetDateTime getCreatedAtOffset() { return createdAt; }
    public void setCreatedAtOffset(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public Instant getCreatedAt() { return createdAt != null ? createdAt.toInstant() : null; }
    public void setCreatedAt(Instant createdAt) {
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private User caregiver;
        private VulnerablePerson vulnerablePerson;
        private String relationshipType = "GUARDIAN";
        private Boolean isPrimary = true;
        private Boolean verified = true;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder caregiver(User caregiver) { this.caregiver = caregiver; return this; }
        public Builder vulnerablePerson(VulnerablePerson vulnerablePerson) { this.vulnerablePerson = vulnerablePerson; return this; }
        public Builder relationshipType(String relationshipType) { this.relationshipType = relationshipType; return this; }
        public Builder isPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; return this; }
        public Builder verified(Boolean verified) { this.verified = verified; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public CaregiverRelationship build() {
            return new CaregiverRelationship(id, caregiver, vulnerablePerson, relationshipType, isPrimary, verified, createdAt);
        }
    }
}
