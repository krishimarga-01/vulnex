package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "shelters")
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "shelter_id", updatable = false, nullable = false)
    private UUID shelterId;

    @Column(name = "shelter_code", nullable = false, unique = true, length = 50)
    private String shelterCode;

    @Column(name = "shelter_name", nullable = false, length = 150)
    private String shelterName;

    @Column(name = "shelter_type", nullable = false, length = 50)
    private String shelterType;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "taluk", length = 100)
    private String taluk;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "contact_person_name", length = 150)
    private String contactPersonName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "is_accessible_disabled", nullable = false)
    private Boolean isAccessibleDisabled = true;

    @Column(name = "has_medical_facility", nullable = false)
    private Boolean hasMedicalFacility = false;

    @Column(name = "has_backup_power", nullable = false)
    private Boolean hasBackupPower = true;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Shelter() {}

    public UUID getShelterId() { return shelterId; }
    public void setShelterId(UUID shelterId) { this.shelterId = shelterId; }

    public String getShelterCode() { return shelterCode; }
    public void setShelterCode(String shelterCode) { this.shelterCode = shelterCode; }

    public String getShelterName() { return shelterName; }
    public void setShelterName(String shelterName) { this.shelterName = shelterName; }

    public String getShelterType() { return shelterType; }
    public void setShelterType(String shelterType) { this.shelterType = shelterType; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getTaluk() { return taluk; }
    public void setTaluk(String taluk) { this.taluk = taluk; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public String getContactPersonName() { return contactPersonName; }
    public void setContactPersonName(String contactPersonName) { this.contactPersonName = contactPersonName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public Boolean getIsAccessibleDisabled() { return isAccessibleDisabled; }
    public void setIsAccessibleDisabled(Boolean isAccessibleDisabled) { this.isAccessibleDisabled = isAccessibleDisabled; }

    public Boolean getHasMedicalFacility() { return hasMedicalFacility; }
    public void setHasMedicalFacility(Boolean hasMedicalFacility) { this.hasMedicalFacility = hasMedicalFacility; }

    public Boolean getHasBackupPower() { return hasBackupPower; }
    public void setHasBackupPower(Boolean hasBackupPower) { this.hasBackupPower = hasBackupPower; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
