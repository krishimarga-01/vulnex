package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "risk_assessments")
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assessment_id", updatable = false, nullable = false)
    private UUID assessmentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "person_id", nullable = false)
    private VulnerablePerson vulnerablePerson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weather_alert_id")
    private WeatherAlert weatherAlert;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rule_id", nullable = false)
    private RiskScoringRule scoringRule;

    @Column(name = "risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal riskScore;

    @Column(name = "risk_classification", nullable = false, length = 20)
    private String riskClassification = "LOW";

    @Column(name = "assessment_explanation", columnDefinition = "TEXT", nullable = false)
    private String assessmentExplanation;

    @Column(name = "assessed_at", nullable = false)
    private OffsetDateTime assessedAt = OffsetDateTime.now();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Transient compatibility fields for legacy controllers and services
    @Transient
    private String assessedBy = "SYSTEM";

    public RiskAssessment() {}

    public RiskAssessment(UUID assessmentId, VulnerablePerson vulnerablePerson, WeatherAlert weatherAlert,
                          RiskScoringRule scoringRule, BigDecimal riskScore, String riskClassification,
                          String assessmentExplanation, OffsetDateTime assessedAt) {
        this.assessmentId = assessmentId;
        this.vulnerablePerson = vulnerablePerson;
        this.weatherAlert = weatherAlert;
        this.scoringRule = scoringRule;
        this.riskScore = riskScore;
        this.riskClassification = riskClassification != null ? riskClassification : "LOW";
        this.assessmentExplanation = assessmentExplanation;
        this.assessedAt = assessedAt != null ? assessedAt : OffsetDateTime.now();
    }

    // Legacy constructor compatibility
    public RiskAssessment(UUID id, VulnerablePerson vulnerablePerson, WeatherAlert weatherAlert,
                          Double calculatedScore, RiskLevel riskLevel, String breakdownJson,
                          Instant assessedAt, String assessedBy) {
        this.assessmentId = id;
        this.vulnerablePerson = vulnerablePerson;
        this.weatherAlert = weatherAlert;
        if (calculatedScore != null) this.riskScore = BigDecimal.valueOf(calculatedScore);
        this.riskClassification = riskLevel != null ? riskLevel.name() : "LOW";
        this.assessmentExplanation = breakdownJson != null ? breakdownJson : "Automated risk assessment score";
        this.assessedBy = assessedBy != null ? assessedBy : "SYSTEM";
        if (assessedAt != null) this.assessedAt = assessedAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getAssessmentId() { return assessmentId; }
    public void setAssessmentId(UUID assessmentId) { this.assessmentId = assessmentId; }

    public UUID getId() { return assessmentId; }
    public void setId(UUID id) { this.assessmentId = id; }

    public VulnerablePerson getVulnerablePerson() { return vulnerablePerson; }
    public void setVulnerablePerson(VulnerablePerson vulnerablePerson) { this.vulnerablePerson = vulnerablePerson; }

    public WeatherAlert getWeatherAlert() { return weatherAlert; }
    public void setWeatherAlert(WeatherAlert weatherAlert) { this.weatherAlert = weatherAlert; }

    public RiskScoringRule getScoringRule() { return scoringRule; }
    public void setScoringRule(RiskScoringRule scoringRule) { this.scoringRule = scoringRule; }

    public BigDecimal getRiskScore() { return riskScore; }
    public void setRiskScore(BigDecimal riskScore) { this.riskScore = riskScore; }

    public String getRiskClassification() { return riskClassification; }
    public void setRiskClassification(String riskClassification) { this.riskClassification = riskClassification; }

    public String getAssessmentExplanation() { return assessmentExplanation; }
    public void setAssessmentExplanation(String assessmentExplanation) { this.assessmentExplanation = assessmentExplanation; }

    public OffsetDateTime getAssessedAtOffset() { return assessedAt; }
    public void setAssessedAtOffset(OffsetDateTime assessedAt) { this.assessedAt = assessedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    // Compatibility getters & setters
    public Double getCalculatedScore() { return riskScore != null ? riskScore.doubleValue() : 0.0; }
    public void setCalculatedScore(Double calculatedScore) {
        if (calculatedScore != null) this.riskScore = BigDecimal.valueOf(calculatedScore);
    }

    public RiskLevel getRiskLevel() {
        try {
            return RiskLevel.valueOf(riskClassification);
        } catch (Exception e) {
            return RiskLevel.LOW;
        }
    }
    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskClassification = riskLevel != null ? riskLevel.name() : "LOW";
    }

    public String getBreakdownJson() { return assessmentExplanation; }
    public void setBreakdownJson(String breakdownJson) { this.assessmentExplanation = breakdownJson; }

    public Instant getAssessedAt() { return assessedAt != null ? assessedAt.toInstant() : null; }
    public void setAssessedAt(Instant assessedAt) {
        if (assessedAt != null) this.assessedAt = assessedAt.atOffset(ZoneOffset.UTC);
    }

    public String getAssessedBy() { return assessedBy; }
    public void setAssessedBy(String assessedBy) { this.assessedBy = assessedBy; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private VulnerablePerson vulnerablePerson;
        private WeatherAlert weatherAlert;
        private Double calculatedScore;
        private RiskLevel riskLevel;
        private String breakdownJson;
        private Instant assessedAt;
        private String assessedBy = "SYSTEM";
        private RiskScoringRule scoringRule;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder scoringRule(RiskScoringRule scoringRule) { this.scoringRule = scoringRule; return this; }
        public Builder vulnerablePerson(VulnerablePerson vulnerablePerson) { this.vulnerablePerson = vulnerablePerson; return this; }
        public Builder weatherAlert(WeatherAlert weatherAlert) { this.weatherAlert = weatherAlert; return this; }
        public Builder calculatedScore(Double calculatedScore) { this.calculatedScore = calculatedScore; return this; }
        public Builder riskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; return this; }
        public Builder breakdownJson(String breakdownJson) { this.breakdownJson = breakdownJson; return this; }
        public Builder assessedAt(Instant assessedAt) { this.assessedAt = assessedAt; return this; }
        public Builder assessedBy(String assessedBy) { this.assessedBy = assessedBy; return this; }

        public RiskAssessment build() {
            RiskAssessment ra = new RiskAssessment(id, vulnerablePerson, weatherAlert, calculatedScore,
                    riskLevel, breakdownJson, assessedAt, assessedBy);
            if (this.scoringRule != null) {
                ra.setScoringRule(this.scoringRule);
            }
            return ra;
        }
    }
}
