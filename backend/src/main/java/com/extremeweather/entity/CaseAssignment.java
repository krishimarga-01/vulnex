package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "case_assignments")
public class CaseAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id", updatable = false, nullable = false)
    private UUID assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private EmergencyCase emergencyCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private ResponseTeam responseTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id")
    private User assignedBy;

    @Column(name = "assignment_notes", columnDefinition = "TEXT")
    private String assignmentNotes;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false)
    private OffsetDateTime assignedAt = OffsetDateTime.now();

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "assignment_status", nullable = false, length = 30)
    private String assignmentStatus = "ACTIVE";

    public CaseAssignment() {}

    public CaseAssignment(UUID assignmentId, EmergencyCase emergencyCase, ResponseTeam responseTeam,
                          User assignedBy, String assignmentNotes, String assignmentStatus) {
        this.assignmentId = assignmentId;
        this.emergencyCase = emergencyCase;
        this.responseTeam = responseTeam;
        this.assignedBy = assignedBy;
        this.assignmentNotes = assignmentNotes;
        this.assignmentStatus = assignmentStatus != null ? assignmentStatus : "ACTIVE";
    }

    // Legacy constructor compatibility
    public CaseAssignment(UUID id, EmergencyCase emergencyCase, ResponseTeam responseTeam,
                          User assignedBy, Instant assignedAt, String notes, String status) {
        this.assignmentId = id;
        this.emergencyCase = emergencyCase;
        this.responseTeam = responseTeam;
        this.assignedBy = assignedBy;
        this.assignmentNotes = notes;
        this.assignmentStatus = status != null ? status : "ACTIVE";
        if (assignedAt != null) this.assignedAt = assignedAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }

    public UUID getId() { return assignmentId; }
    public void setId(UUID id) { this.assignmentId = id; }

    public EmergencyCase getEmergencyCase() { return emergencyCase; }
    public void setEmergencyCase(EmergencyCase emergencyCase) { this.emergencyCase = emergencyCase; }

    public ResponseTeam getResponseTeam() { return responseTeam; }
    public void setResponseTeam(ResponseTeam responseTeam) { this.responseTeam = responseTeam; }

    public User getAssignedBy() { return assignedBy; }
    public void setAssignedBy(User assignedBy) { this.assignedBy = assignedBy; }

    public String getAssignmentNotes() { return assignmentNotes; }
    public void setAssignmentNotes(String assignmentNotes) { this.assignmentNotes = assignmentNotes; }

    public String getNotes() { return assignmentNotes; }
    public void setNotes(String notes) { this.assignmentNotes = notes; }

    public OffsetDateTime getAssignedAtOffset() { return assignedAt; }
    public void setAssignedAtOffset(OffsetDateTime assignedAt) { this.assignedAt = assignedAt; }

    public Instant getAssignedAt() { return assignedAt != null ? assignedAt.toInstant() : null; }
    public void setAssignedAt(Instant assignedAt) {
        if (assignedAt != null) this.assignedAt = assignedAt.atOffset(ZoneOffset.UTC);
    }

    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime completedAt) { this.completedAt = completedAt; }

    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }

    public String getStatus() { return assignmentStatus; }
    public void setStatus(String status) { this.assignmentStatus = status; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private EmergencyCase emergencyCase;
        private ResponseTeam responseTeam;
        private User assignedBy;
        private Instant assignedAt;
        private String notes;
        private String status = "ACTIVE";

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder emergencyCase(EmergencyCase emergencyCase) { this.emergencyCase = emergencyCase; return this; }
        public Builder responseTeam(ResponseTeam responseTeam) { this.responseTeam = responseTeam; return this; }
        public Builder assignedBy(User assignedBy) { this.assignedBy = assignedBy; return this; }
        public Builder assignedAt(Instant assignedAt) { this.assignedAt = assignedAt; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder status(String status) { this.status = status; return this; }

        public CaseAssignment build() {
            return new CaseAssignment(id, emergencyCase, responseTeam, assignedBy, assignedAt, notes, status);
        }
    }
}
