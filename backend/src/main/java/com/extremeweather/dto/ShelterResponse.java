package com.extremeweather.dto;

import com.extremeweather.entity.Shelter;

import java.math.BigDecimal;
import java.util.UUID;

public class ShelterResponse {
    private UUID shelterId;
    private String shelterCode;
    private String shelterName;
    private String shelterType;
    private String district;
    private String taluk;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String contactPersonName;
    private String contactPhone;
    private Boolean isAccessibleDisabled;
    private Boolean hasMedicalFacility;
    private Boolean hasBackupPower;
    private String status;

    public ShelterResponse() {}

    public static ShelterResponse fromEntity(Shelter s) {
        ShelterResponse r = new ShelterResponse();
        r.setShelterId(s.getShelterId());
        r.setShelterCode(s.getShelterCode());
        r.setShelterName(s.getShelterName());
        r.setShelterType(s.getShelterType());
        r.setDistrict(s.getDistrict());
        r.setTaluk(s.getTaluk());
        r.setAddress(s.getAddress());
        r.setLatitude(s.getLatitude());
        r.setLongitude(s.getLongitude());
        r.setContactPersonName(s.getContactPersonName());
        r.setContactPhone(s.getContactPhone());
        r.setIsAccessibleDisabled(s.getIsAccessibleDisabled());
        r.setHasMedicalFacility(s.getHasMedicalFacility());
        r.setHasBackupPower(s.getHasBackupPower());
        r.setStatus(s.getStatus());
        return r;
    }

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
}
