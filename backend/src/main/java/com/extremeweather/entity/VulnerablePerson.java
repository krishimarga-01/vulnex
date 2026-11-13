package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "vulnerable_persons")
@SQLRestriction("deleted_at IS NULL")
public class VulnerablePerson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "person_id", updatable = false, nullable = false)
    private UUID personId;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "age")
    private Integer age;

    @Column(name = "age_category", nullable = false, length = 30)
    private String ageCategory = "ADULT";

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "primary_phone", length = 20)
    private String primaryPhone;

    @Column(name = "address_line", columnDefinition = "TEXT")
    private String addressLine;

    @Column(name = "village_or_locality", length = 100)
    private String villageOrLocality;

    @Column(name = "taluk", length = 100)
    private String taluk;

    @Column(name = "district", nullable = false, length = 100)
    private String district = "Bengaluru Urban";

    @Column(name = "state", nullable = false, length = 100)
    private String state = "Karnataka";

    @Column(name = "postal_code", length = 15)
    private String postalCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "primary_category_id")
    private VulnerabilityCategoryEntity primaryCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "geographical_region_id")
    private GeographicalRegion geographicalRegion;

    @Column(name = "location", columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "verification_status", nullable = false, length = 30)
    private String verificationStatus = "UNVERIFIED";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private User verifiedBy;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @Column(name = "consent_status", nullable = false, length = 30)
    private String consentStatus = "GIVEN";

    @Column(name = "consent_date")
    private OffsetDateTime consentDate;

    @Column(name = "medical_notes_encrypted", columnDefinition = "TEXT")
    private String medicalNotesEncrypted;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by_user_id")
    private User registeredBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Transient compatibility fields for legacy controllers, DTOs, and services
    @Transient
    private String nationalId;

    @Transient
    private MobilityStatus mobilityStatus = MobilityStatus.INDEPENDENT;

    @Transient
    private String assistanceRequirements;

    @Transient
    private String emergencyContactName;

    @Transient
    private String emergencyContactPhone;

    @Transient
    private String emergencyContactRelationship;

    @Transient
    private User caregiver;

    @Transient
    private RiskLevel currentRiskLevel = RiskLevel.LOW;

    @Transient
    private Double currentRiskScore = 0.0;

    public VulnerablePerson() {}

    public VulnerablePerson(UUID id, String nationalId, String fullName, Integer age, LocalDate dateOfBirth,
                            String gender, VulnerabilityCategory vulnerabilityCategory, String medicalConditions,
                            MobilityStatus mobilityStatus, String assistanceRequirements, String contactNumber,
                            String address, String emergencyContactName, String emergencyContactPhone,
                            String emergencyContactRelationship, Double latitude, Double longitude,
                            User registeredBy, User caregiver, VerificationStatus verificationStatus,
                            Boolean consentGiven, RiskLevel currentRiskLevel, Double currentRiskScore,
                            Instant createdAt, Instant updatedAt) {
        this.personId = id;
        this.nationalId = nationalId;
        this.fullName = fullName;
        this.age = age;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.medicalNotesEncrypted = medicalConditions;
        this.mobilityStatus = mobilityStatus != null ? mobilityStatus : MobilityStatus.INDEPENDENT;
        this.assistanceRequirements = assistanceRequirements;
        this.primaryPhone = contactNumber;
        this.addressLine = address;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.emergencyContactRelationship = emergencyContactRelationship;
        if (latitude != null) this.latitude = BigDecimal.valueOf(latitude);
        if (longitude != null) this.longitude = BigDecimal.valueOf(longitude);
        this.registeredBy = registeredBy;
        this.caregiver = caregiver;
        this.verificationStatus = verificationStatus != null ? verificationStatus.name() : "UNVERIFIED";
        this.consentStatus = Boolean.FALSE.equals(consentGiven) ? "WITHDRAWN" : "GIVEN";
        this.currentRiskLevel = currentRiskLevel != null ? currentRiskLevel : RiskLevel.LOW;
        this.currentRiskScore = currentRiskScore != null ? currentRiskScore : 0.0;
        this.district = "Bengaluru Urban";
        this.state = "Karnataka";
        this.ageCategory = (age != null && age >= 60) ? "SENIOR_CITIZEN" : (age != null && age < 12) ? "CHILD" : "ADULT";
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
        if (updatedAt != null) this.updatedAt = updatedAt.atOffset(ZoneOffset.UTC);
    }

    @PrePersist
    @PreUpdate
    public void syncCoordinates() {
        if (latitude != null && longitude != null) {
            org.locationtech.jts.geom.GeometryFactory gf = new org.locationtech.jts.geom.GeometryFactory(new org.locationtech.jts.geom.PrecisionModel(), 4326);
            this.location = gf.createPoint(new org.locationtech.jts.geom.Coordinate(longitude.doubleValue(), latitude.doubleValue()));
        }
        if (this.district == null || this.district.isBlank()) {
            this.district = "Bengaluru Urban";
        }
        if (this.state == null || this.state.isBlank()) {
            this.state = "Karnataka";
        }
        if (this.ageCategory == null || this.ageCategory.isBlank()) {
            this.ageCategory = (age != null && age >= 60) ? "SENIOR_CITIZEN" : (age != null && age < 12) ? "CHILD" : "ADULT";
        }
        if (this.verificationStatus == null) {
            this.verificationStatus = "UNVERIFIED";
        }
        if (this.consentStatus == null) {
            this.consentStatus = "GIVEN";
        }
    }

    public UUID getPersonId() { return personId; }
    public void setPersonId(UUID personId) { this.personId = personId; }

    public UUID getId() { return personId; }
    public void setId(UUID id) { this.personId = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) {
        this.age = age;
        if (age != null) {
            if (age < 5) this.ageCategory = "INFANT";
            else if (age < 18) this.ageCategory = "CHILD";
            else if (age >= 60) this.ageCategory = "SENIOR_CITIZEN";
            else this.ageCategory = "ADULT";
        }
    }

    public String getAgeCategory() { return ageCategory; }
    public void setAgeCategory(String ageCategory) { this.ageCategory = ageCategory; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPrimaryPhone() { return primaryPhone; }
    public void setPrimaryPhone(String primaryPhone) { this.primaryPhone = primaryPhone; }

    public String getContactNumber() { return primaryPhone; }
    public void setContactNumber(String contactNumber) { this.primaryPhone = contactNumber; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getAddress() { return addressLine; }
    public void setAddress(String address) { this.addressLine = address; }

    public String getVillageOrLocality() { return villageOrLocality; }
    public void setVillageOrLocality(String villageOrLocality) { this.villageOrLocality = villageOrLocality; }

    public String getTaluk() { return taluk; }
    public void setTaluk(String taluk) { this.taluk = taluk; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public VulnerabilityCategoryEntity getPrimaryCategory() { return primaryCategory; }
    public void setPrimaryCategory(VulnerabilityCategoryEntity primaryCategory) { this.primaryCategory = primaryCategory; }

    public GeographicalRegion getGeographicalRegion() { return geographicalRegion; }
    public void setGeographicalRegion(GeographicalRegion geographicalRegion) { this.geographicalRegion = geographicalRegion; }

    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }

    public BigDecimal getLatitudeValue() { return latitude; }
    public void setLatitudeValue(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitudeValue() { return longitude; }
    public void setLongitudeValue(BigDecimal longitude) { this.longitude = longitude; }

    public Double getLatitude() { return latitude != null ? latitude.doubleValue() : null; }
    public void setLatitude(Double latitude) {
        if (latitude != null) this.latitude = BigDecimal.valueOf(latitude);
    }

    public Double getLongitude() { return longitude != null ? longitude.doubleValue() : null; }
    public void setLongitude(Double longitude) {
        if (longitude != null) this.longitude = BigDecimal.valueOf(longitude);
    }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public VerificationStatus getVerificationStatusEnum() {
        try {
            return VerificationStatus.valueOf(verificationStatus);
        } catch (Exception e) {
            return VerificationStatus.PENDING_VERIFICATION;
        }
    }
    public void setVerificationStatusEnum(VerificationStatus status) {
        this.verificationStatus = status != null ? status.name() : "UNVERIFIED";
    }

    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }

    public OffsetDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(OffsetDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getConsentStatus() { return consentStatus; }
    public void setConsentStatus(String consentStatus) { this.consentStatus = consentStatus; }

    public Boolean getConsentGiven() { return !"WITHDRAWN".equalsIgnoreCase(consentStatus); }
    public void setConsentGiven(Boolean consentGiven) {
        this.consentStatus = Boolean.FALSE.equals(consentGiven) ? "WITHDRAWN" : "GIVEN";
    }

    public OffsetDateTime getConsentDate() { return consentDate; }
    public void setConsentDate(OffsetDateTime consentDate) { this.consentDate = consentDate; }

    public String getMedicalNotesEncrypted() { return medicalNotesEncrypted; }
    public void setMedicalNotesEncrypted(String medicalNotesEncrypted) { this.medicalNotesEncrypted = medicalNotesEncrypted; }

    public String getMedicalConditions() { return medicalNotesEncrypted; }
    public void setMedicalConditions(String medicalConditions) { this.medicalNotesEncrypted = medicalConditions; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public OffsetDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }

    public User getRegisteredBy() { return registeredBy; }
    public void setRegisteredBy(User registeredBy) { this.registeredBy = registeredBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public VulnerabilityCategory getVulnerabilityCategory() {
        if (primaryCategory != null && primaryCategory.getCategoryCode() != null) {
            String code = primaryCategory.getCategoryCode();
            if ("ELDERLY".equalsIgnoreCase(code)) return VulnerabilityCategory.ELDERLY;
            if ("CHILD".equalsIgnoreCase(code)) return VulnerabilityCategory.CHILD;
            if ("PERSON_WITH_DISABILITY".equalsIgnoreCase(code) || "DISABILITY".equalsIgnoreCase(code)) return VulnerabilityCategory.DISABILITY;
            if ("PREGNANT_WOMAN".equalsIgnoreCase(code) || "PREGNANT".equalsIgnoreCase(code)) return VulnerabilityCategory.PREGNANT;
            if ("MEDICAL_ASSISTANCE_REQUIRED".equalsIgnoreCase(code) || "MEDICAL_ASSISTANCE".equalsIgnoreCase(code)) return VulnerabilityCategory.MEDICAL_ASSISTANCE;
            try {
                return VulnerabilityCategory.valueOf(code);
            } catch (Exception ignored) {}
        }
        return VulnerabilityCategory.ELDERLY;
    }

    public void setVulnerabilityCategory(VulnerabilityCategory cat) {
        // Handled via primaryCategory entity
    }

    public String getNationalId() { return nationalId; }
    public void setNationalId(String nationalId) { this.nationalId = nationalId; }

    public MobilityStatus getMobilityStatus() { return mobilityStatus; }
    public void setMobilityStatus(MobilityStatus mobilityStatus) { this.mobilityStatus = mobilityStatus; }

    public String getAssistanceRequirements() { return assistanceRequirements; }
    public void setAssistanceRequirements(String assistanceRequirements) { this.assistanceRequirements = assistanceRequirements; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getEmergencyContactRelationship() { return emergencyContactRelationship; }
    public void setEmergencyContactRelationship(String emergencyContactRelationship) { this.emergencyContactRelationship = emergencyContactRelationship; }

    public User getCaregiver() { return caregiver; }
    public void setCaregiver(User caregiver) { this.caregiver = caregiver; }

    public RiskLevel getCurrentRiskLevel() {
        if (currentRiskLevel != null && currentRiskLevel != RiskLevel.LOW) {
            return currentRiskLevel;
        }
        if (mobilityStatus == MobilityStatus.BEDRIDDEN || (age != null && age >= 75)) {
            return RiskLevel.HIGH;
        }
        if (mobilityStatus == MobilityStatus.WHEELCHAIR || (age != null && age >= 60)) {
            return RiskLevel.MEDIUM;
        }
        return currentRiskLevel != null ? currentRiskLevel : RiskLevel.LOW;
    }
    public void setCurrentRiskLevel(RiskLevel currentRiskLevel) { this.currentRiskLevel = currentRiskLevel; }

    public Double getCurrentRiskScore() { return currentRiskScore; }
    public void setCurrentRiskScore(Double currentRiskScore) { this.currentRiskScore = currentRiskScore; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String nationalId;
        private String fullName;
        private Integer age;
        private LocalDate dateOfBirth;
        private String gender;
        private VulnerabilityCategory vulnerabilityCategory;
        private String medicalConditions;
        private MobilityStatus mobilityStatus = MobilityStatus.INDEPENDENT;
        private String assistanceRequirements;
        private String contactNumber;
        private String address;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelationship;
        private Double latitude;
        private Double longitude;
        private User registeredBy;
        private User caregiver;
        private VerificationStatus verificationStatus = VerificationStatus.VERIFIED;
        private Boolean consentGiven = true;
        private RiskLevel currentRiskLevel = RiskLevel.LOW;
        private Double currentRiskScore = 0.0;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder nationalId(String nationalId) { this.nationalId = nationalId; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder age(Integer age) { this.age = age; return this; }
        public Builder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public Builder gender(String gender) { this.gender = gender; return this; }
        public Builder vulnerabilityCategory(VulnerabilityCategory vulnerabilityCategory) { this.vulnerabilityCategory = vulnerabilityCategory; return this; }
        public Builder medicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; return this; }
        public Builder mobilityStatus(MobilityStatus mobilityStatus) { this.mobilityStatus = mobilityStatus; return this; }
        public Builder assistanceRequirements(String assistanceRequirements) { this.assistanceRequirements = assistanceRequirements; return this; }
        public Builder contactNumber(String contactNumber) { this.contactNumber = contactNumber; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder emergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; return this; }
        public Builder emergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; return this; }
        public Builder emergencyContactRelationship(String emergencyContactRelationship) { this.emergencyContactRelationship = emergencyContactRelationship; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder registeredBy(User registeredBy) { this.registeredBy = registeredBy; return this; }
        public Builder caregiver(User caregiver) { this.caregiver = caregiver; return this; }
        public Builder verificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; return this; }
        public Builder consentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; return this; }
        public Builder currentRiskLevel(RiskLevel currentRiskLevel) { this.currentRiskLevel = currentRiskLevel; return this; }
        public Builder currentRiskScore(Double currentRiskScore) { this.currentRiskScore = currentRiskScore; return this; }

        public VulnerablePerson build() {
            return new VulnerablePerson(id, nationalId, fullName, age, dateOfBirth, gender,
                    vulnerabilityCategory, medicalConditions, mobilityStatus, assistanceRequirements,
                    contactNumber, address, emergencyContactName, emergencyContactPhone,
                    emergencyContactRelationship, latitude, longitude, registeredBy, caregiver,
                    verificationStatus, consentGiven, currentRiskLevel, currentRiskScore,
                    Instant.now(), Instant.now());
        }
    }
}
