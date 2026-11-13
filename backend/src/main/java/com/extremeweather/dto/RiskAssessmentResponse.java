package com.extremeweather.dto;

import com.extremeweather.entity.RiskLevel;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class RiskAssessmentResponse {

    private UUID assessmentId;
    private UUID vulnerablePersonId;
    private String personName;
    private Double calculatedScore;
    private RiskLevel riskLevel;
    private List<ScoreBreakdownDto> breakdown;
    private Instant assessedAt;
    private String assessedBy;

    public static class ScoreBreakdownDto {
        private String ruleCode;
        private String factor;
        private Double pointsAdded;
        private String explanation;

        public ScoreBreakdownDto() {}

        public ScoreBreakdownDto(String ruleCode, String factor, Double pointsAdded, String explanation) {
            this.ruleCode = ruleCode;
            this.factor = factor;
            this.pointsAdded = pointsAdded;
            this.explanation = explanation;
        }

        public String getRuleCode() { return ruleCode; }
        public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }
        public String getFactor() { return factor; }
        public void setFactor(String factor) { this.factor = factor; }
        public Double getPointsAdded() { return pointsAdded; }
        public void setPointsAdded(Double pointsAdded) { this.pointsAdded = pointsAdded; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public RiskAssessmentResponse() {}

    public RiskAssessmentResponse(UUID assessmentId, UUID vulnerablePersonId, String personName, Double calculatedScore,
                                  RiskLevel riskLevel, List<ScoreBreakdownDto> breakdown, Instant assessedAt, String assessedBy) {
        this.assessmentId = assessmentId;
        this.vulnerablePersonId = vulnerablePersonId;
        this.personName = personName;
        this.calculatedScore = calculatedScore;
        this.riskLevel = riskLevel;
        this.breakdown = breakdown;
        this.assessedAt = assessedAt;
        this.assessedBy = assessedBy;
    }

    public UUID getAssessmentId() { return assessmentId; }
    public void setAssessmentId(UUID assessmentId) { this.assessmentId = assessmentId; }

    public UUID getVulnerablePersonId() { return vulnerablePersonId; }
    public void setVulnerablePersonId(UUID vulnerablePersonId) { this.vulnerablePersonId = vulnerablePersonId; }

    public String getPersonName() { return personName; }
    public void setPersonName(String personName) { this.personName = personName; }

    public Double getCalculatedScore() { return calculatedScore; }
    public void setCalculatedScore(Double calculatedScore) { this.calculatedScore = calculatedScore; }

    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }

    public List<ScoreBreakdownDto> getBreakdown() { return breakdown; }
    public void setBreakdown(List<ScoreBreakdownDto> breakdown) { this.breakdown = breakdown; }

    public Instant getAssessedAt() { return assessedAt; }
    public void setAssessedAt(Instant assessedAt) { this.assessedAt = assessedAt; }

    public String getAssessedBy() { return assessedBy; }
    public void setAssessedBy(String assessedBy) { this.assessedBy = assessedBy; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID assessmentId;
        private UUID vulnerablePersonId;
        private String personName;
        private Double calculatedScore;
        private RiskLevel riskLevel;
        private List<ScoreBreakdownDto> breakdown;
        private Instant assessedAt;
        private String assessedBy;

        public Builder assessmentId(UUID assessmentId) { this.assessmentId = assessmentId; return this; }
        public Builder vulnerablePersonId(UUID vulnerablePersonId) { this.vulnerablePersonId = vulnerablePersonId; return this; }
        public Builder personName(String personName) { this.personName = personName; return this; }
        public Builder calculatedScore(Double calculatedScore) { this.calculatedScore = calculatedScore; return this; }
        public Builder riskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; return this; }
        public Builder breakdown(List<ScoreBreakdownDto> breakdown) { this.breakdown = breakdown; return this; }
        public Builder assessedAt(Instant assessedAt) { this.assessedAt = assessedAt; return this; }
        public Builder assessedAt(OffsetDateTime assessedAt) {
            this.assessedAt = assessedAt != null ? assessedAt.toInstant() : null;
            return this;
        }
        public Builder assessedBy(String assessedBy) { this.assessedBy = assessedBy; return this; }

        public RiskAssessmentResponse build() {
            return new RiskAssessmentResponse(assessmentId, vulnerablePersonId, personName, calculatedScore,
                    riskLevel, breakdown, assessedAt, assessedBy);
        }
    }
}
