package com.extremeweather.dto;

import com.extremeweather.entity.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class VulnerablePersonResponse {

    private UUID id;
    private String nationalId;
    private String fullName;
    private Integer age;
    private LocalDate dateOfBirth;
    private String gender;
    private VulnerabilityCategory vulnerabilityCategory;
    private String medicalConditions;
    private MobilityStatus mobilityStatus;
    private String assistanceRequirements;

    // Contact details
    private String contactNumber;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    private Double latitude;
    private Double longitude;

    private UUID registeredByUserId;
    private String registeredByUsername;
    private UUID caregiverUserId;
    private String caregiverName;

    private VerificationStatus verificationStatus;
    private Boolean consentGiven;
    private RiskLevel currentRiskLevel;
    private Double currentRiskScore;

    private Instant createdAt;
    private Instant updatedAt;

    public VulnerablePersonResponse() {}

    public VulnerablePersonResponse(UUID id, String nationalId, String fullName, Integer age, LocalDate dateOfBirth, String gender, VulnerabilityCategory vulnerabilityCategory, String medicalConditions, MobilityStatus mobilityStatus, String assistanceRequirements, String contactNumber, String address, String emergencyContactName, String emergencyContactPhone, String emergencyContactRelationship, Double latitude, Double longitude, UUID registeredByUserId, String registeredByUsername, UUID caregiverUserId, String caregiverName, VerificationStatus verificationStatus, Boolean consentGiven, RiskLevel currentRiskLevel, Double currentRiskScore, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.nationalId = nationalId;
        this.fullName = fullName;
        this.age = age;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.vulnerabilityCategory = vulnerabilityCategory;
        this.medicalConditions = medicalConditions;
        this.mobilityStatus = mobilityStatus;
        this.assistanceRequirements = assistanceRequirements;
        this.contactNumber = contactNumber;
        this.address = address;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.emergencyContactRelationship = emergencyContactRelationship;
        this.latitude = latitude;
        this.longitude = longitude;
        this.registeredByUserId = registeredByUserId;
        this.registeredByUsername = registeredByUsername;
        this.caregiverUserId = caregiverUserId;
        this.caregiverName = caregiverName;
        this.verificationStatus = verificationStatus;
        this.consentGiven = consentGiven;
        this.currentRiskLevel = currentRiskLevel;
        this.currentRiskScore = currentRiskScore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getNationalId() { return nationalId; }
    public void setNationalId(String nationalId) { this.nationalId = nationalId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public VulnerabilityCategory getVulnerabilityCategory() { return vulnerabilityCategory; }
    public void setVulnerabilityCategory(VulnerabilityCategory vulnerabilityCategory) { this.vulnerabilityCategory = vulnerabilityCategory; }

    public String getMedicalConditions() { return medicalConditions; }
    public void setMedicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; }

    public MobilityStatus getMobilityStatus() { return mobilityStatus; }
    public void setMobilityStatus(MobilityStatus mobilityStatus) { this.mobilityStatus = mobilityStatus; }

    public String getAssistanceRequirements() { return assistanceRequirements; }
    public void setAssistanceRequirements(String assistanceRequirements) { this.assistanceRequirements = assistanceRequirements; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getEmergencyContactRelationship() { return emergencyContactRelationship; }
    public void setEmergencyContactRelationship(String emergencyContactRelationship) { this.emergencyContactRelationship = emergencyContactRelationship; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public UUID getRegisteredByUserId() { return registeredByUserId; }
    public void setRegisteredByUserId(UUID registeredByUserId) { this.registeredByUserId = registeredByUserId; }

    public String getRegisteredByUsername() { return registeredByUsername; }
    public void setRegisteredByUsername(String registeredByUsername) { this.registeredByUsername = registeredByUsername; }

    public UUID getCaregiverUserId() { return caregiverUserId; }
    public void setCaregiverUserId(UUID caregiverUserId) { this.caregiverUserId = caregiverUserId; }

    public String getCaregiverName() { return caregiverName; }
    public void setCaregiverName(String caregiverName) { this.caregiverName = caregiverName; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public Boolean getConsentGiven() { return consentGiven; }
    public void setConsentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; }

    public RiskLevel getCurrentRiskLevel() { return currentRiskLevel; }
    public void setCurrentRiskLevel(RiskLevel currentRiskLevel) { this.currentRiskLevel = currentRiskLevel; }

    public Double getCurrentRiskScore() { return currentRiskScore; }
    public void setCurrentRiskScore(Double currentRiskScore) { this.currentRiskScore = currentRiskScore; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

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
        private MobilityStatus mobilityStatus;
        private String assistanceRequirements;
        private String contactNumber;
        private String address;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String emergencyContactRelationship;
        private Double latitude;
        private Double longitude;
        private UUID registeredByUserId;
        private String registeredByUsername;
        private UUID caregiverUserId;
        private String caregiverName;
        private VerificationStatus verificationStatus;
        private Boolean consentGiven;
        private RiskLevel currentRiskLevel;
        private Double currentRiskScore;
        private Instant createdAt;
        private Instant updatedAt;

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
        public Builder registeredByUserId(UUID registeredByUserId) { this.registeredByUserId = registeredByUserId; return this; }
        public Builder registeredByUsername(String registeredByUsername) { this.registeredByUsername = registeredByUsername; return this; }
        public Builder caregiverUserId(UUID caregiverUserId) { this.caregiverUserId = caregiverUserId; return this; }
        public Builder caregiverName(String caregiverName) { this.caregiverName = caregiverName; return this; }
        public Builder verificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; return this; }
        public Builder consentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; return this; }
        public Builder currentRiskLevel(RiskLevel currentRiskLevel) { this.currentRiskLevel = currentRiskLevel; return this; }
        public Builder currentRiskScore(Double currentRiskScore) { this.currentRiskScore = currentRiskScore; return this; }
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

        public VulnerablePersonResponse build() {
            return new VulnerablePersonResponse(id, nationalId, fullName, age, dateOfBirth, gender,
                    vulnerabilityCategory, medicalConditions, mobilityStatus, assistanceRequirements,
                    contactNumber, address, emergencyContactName, emergencyContactPhone,
                    emergencyContactRelationship, latitude, longitude, registeredByUserId,
                    registeredByUsername, caregiverUserId, caregiverName, verificationStatus,
                    consentGiven, currentRiskLevel, currentRiskScore, createdAt, updatedAt);
        }
    }
}
