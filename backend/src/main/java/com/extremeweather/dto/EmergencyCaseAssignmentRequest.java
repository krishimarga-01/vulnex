package com.extremeweather.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class EmergencyCaseAssignmentRequest {

    @NotNull(message = "Response team ID is required")
    private UUID responseTeamId;

    private String notes;

    public EmergencyCaseAssignmentRequest() {}

    public EmergencyCaseAssignmentRequest(UUID responseTeamId, String notes) {
        this.responseTeamId = responseTeamId;
        this.notes = notes;
    }

    public UUID getResponseTeamId() { return responseTeamId; }
    public void setResponseTeamId(UUID responseTeamId) { this.responseTeamId = responseTeamId; }
    public void setResponseTeamId(String responseTeamId) {
        if (responseTeamId != null && !responseTeamId.isBlank()) {
            try { this.responseTeamId = UUID.fromString(responseTeamId); } catch (Exception ignored) {}
        }
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID responseTeamId;
        private String notes;

        public Builder responseTeamId(UUID responseTeamId) { this.responseTeamId = responseTeamId; return this; }
        public Builder responseTeamId(String responseTeamId) {
            if (responseTeamId != null && !responseTeamId.isBlank()) {
                try { this.responseTeamId = UUID.fromString(responseTeamId); } catch (Exception ignored) {}
            }
            return this;
        }
        public Builder notes(String notes) { this.notes = notes; return this; }

        public EmergencyCaseAssignmentRequest build() {
            return new EmergencyCaseAssignmentRequest(responseTeamId, notes);
        }
    }
}
