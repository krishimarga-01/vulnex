package com.extremeweather.dto;

import com.extremeweather.entity.CaseStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;

public class EmergencyCaseStatusUpdateRequest {

    @NotNull(message = "New case status is required")
    private CaseStatus status;

    @JsonAlias({"notes", "resolutionNotes"})
    private String resolutionDetails;

    public EmergencyCaseStatusUpdateRequest() {}

    public EmergencyCaseStatusUpdateRequest(CaseStatus status, String resolutionDetails) {
        this.status = status;
        this.resolutionDetails = resolutionDetails;
    }

    public CaseStatus getStatus() { return status; }
    public void setStatus(CaseStatus status) { this.status = status; }
    public String getResolutionDetails() { return resolutionDetails; }
    public void setResolutionDetails(String resolutionDetails) { this.resolutionDetails = resolutionDetails; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private CaseStatus status;
        private String resolutionDetails;
        public Builder status(CaseStatus status) { this.status = status; return this; }
        public Builder resolutionDetails(String resolutionDetails) { this.resolutionDetails = resolutionDetails; return this; }
        public EmergencyCaseStatusUpdateRequest build() {
            return new EmergencyCaseStatusUpdateRequest(status, resolutionDetails);
        }
    }
}
