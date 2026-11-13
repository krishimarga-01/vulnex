package com.extremeweather.dto;

import com.extremeweather.entity.EmergencyCategory;
import com.extremeweather.entity.EmergencyPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class EmergencyCaseRequest {

    private UUID affectedPersonId;

    @NotNull(message = "Emergency category is required")
    private EmergencyCategory emergencyCategory;

    @NotBlank(message = "Description of the emergency is required")
    private String description;

    private EmergencyPriority priority = EmergencyPriority.HIGH;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String address;

    public EmergencyCaseRequest() {}

    public EmergencyCaseRequest(UUID affectedPersonId, EmergencyCategory emergencyCategory, String description, EmergencyPriority priority, Double latitude, Double longitude, String address) {
        this.affectedPersonId = affectedPersonId;
        this.emergencyCategory = emergencyCategory;
        this.description = description;
        this.priority = priority;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
    }

    public UUID getAffectedPersonId() { return affectedPersonId; }
    public void setAffectedPersonId(UUID affectedPersonId) { this.affectedPersonId = affectedPersonId; }
    public void setAffectedPersonId(String affectedPersonId) {
        if (affectedPersonId != null && !affectedPersonId.isBlank()) {
            try { this.affectedPersonId = UUID.fromString(affectedPersonId); } catch (Exception ignored) {}
        }
    }

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

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID affectedPersonId;
        private EmergencyCategory emergencyCategory;
        private String description;
        private EmergencyPriority priority = EmergencyPriority.HIGH;
        private Double latitude;
        private Double longitude;
        private String address;

        public Builder affectedPersonId(UUID affectedPersonId) { this.affectedPersonId = affectedPersonId; return this; }
        public Builder affectedPersonId(String affectedPersonId) {
            if (affectedPersonId != null && !affectedPersonId.isBlank()) {
                try { this.affectedPersonId = UUID.fromString(affectedPersonId); } catch (Exception ignored) {}
            }
            return this;
        }
        public Builder emergencyCategory(EmergencyCategory emergencyCategory) { this.emergencyCategory = emergencyCategory; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder priority(EmergencyPriority priority) { this.priority = priority; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder address(String address) { this.address = address; return this; }

        public EmergencyCaseRequest build() {
            return new EmergencyCaseRequest(affectedPersonId, emergencyCategory, description, priority, latitude, longitude, address);
        }
    }
}
