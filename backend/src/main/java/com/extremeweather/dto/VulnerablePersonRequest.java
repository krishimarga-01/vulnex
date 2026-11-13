package com.extremeweather.dto;

import com.extremeweather.entity.MobilityStatus;
import com.extremeweather.entity.VulnerabilityCategory;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.UUID;

public class VulnerablePersonRequest {

    private String nationalId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 130, message = "Age is invalid")
    private Integer age;

    private LocalDate dateOfBirth;
    private String gender;

    @NotNull(message = "Vulnerability category is required")
    private VulnerabilityCategory vulnerabilityCategory;

    private String medicalConditions;
    private MobilityStatus mobilityStatus;
    private String assistanceRequirements;
    private String contactNumber;
    private String address;

    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private UUID caregiverUserId;
    private Boolean consentGiven = true;

    public VulnerablePersonRequest() {}

    public VulnerablePersonRequest(String nationalId, String fullName, Integer age, LocalDate dateOfBirth,
                                   String gender, VulnerabilityCategory vulnerabilityCategory,
                                   String medicalConditions, MobilityStatus mobilityStatus,
                                   String assistanceRequirements, String contactNumber, String address,
                                   String emergencyContactName, String emergencyContactPhone,
                                   String emergencyContactRelationship, Double latitude, Double longitude,
                                   UUID caregiverUserId, Boolean consentGiven) {
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
        this.caregiverUserId = caregiverUserId;
        this.consentGiven = consentGiven;
    }

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

    public UUID getCaregiverUserId() { return caregiverUserId; }
    public void setCaregiverUserId(UUID caregiverUserId) { this.caregiverUserId = caregiverUserId; }
    public void setCaregiverUserId(String caregiverUserId) {
        if (caregiverUserId != null && !caregiverUserId.isBlank()) {
            try { this.caregiverUserId = UUID.fromString(caregiverUserId); } catch (Exception ignored) {}
        }
    }

    public Boolean getConsentGiven() { return consentGiven; }
    public void setConsentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
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
        private UUID caregiverUserId;
        private Boolean consentGiven = true;

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
        public Builder caregiverUserId(UUID caregiverUserId) { this.caregiverUserId = caregiverUserId; return this; }
        public Builder caregiverUserId(String caregiverUserId) {
            if (caregiverUserId != null && !caregiverUserId.isBlank()) {
                try { this.caregiverUserId = UUID.fromString(caregiverUserId); } catch (Exception ignored) {}
            }
            return this;
        }
        public Builder consentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; return this; }

        public VulnerablePersonRequest build() {
            return new VulnerablePersonRequest(nationalId, fullName, age, dateOfBirth, gender,
                    vulnerabilityCategory, medicalConditions, mobilityStatus, assistanceRequirements,
                    contactNumber, address, emergencyContactName, emergencyContactPhone,
                    emergencyContactRelationship, latitude, longitude, caregiverUserId, consentGiven);
        }
    }
}
