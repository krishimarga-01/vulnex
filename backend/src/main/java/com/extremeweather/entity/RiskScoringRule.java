package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "risk_scoring_rules")
public class RiskScoringRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rule_id", updatable = false, nullable = false)
    private UUID ruleId;

    @Column(name = "rule_version", nullable = false, unique = true, length = 30)
    private String ruleVersion;

    @Column(name = "rule_name", nullable = false, length = 150)
    private String ruleName;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "parameters", columnDefinition = "jsonb", nullable = false)
    private String parameters = "{}";

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Transient compatibility fields for legacy controllers and services
    @Transient
    private String ruleCode;

    @Transient
    private String category;

    @Transient
    private String description;

    @Transient
    private String conditionField;

    @Transient
    private String operator;

    @Transient
    private String thresholdValue;

    @Transient
    private Double scoreWeight = 1.0;

    @Transient
    private OffsetDateTime updatedAt;

    public RiskScoringRule() {}

    public RiskScoringRule(UUID ruleId, String ruleVersion, String ruleName, String parameters, Boolean isActive, User createdByUser) {
        this.ruleId = ruleId;
        this.ruleVersion = ruleVersion;
        this.ruleName = ruleName;
        this.parameters = parameters != null ? parameters : "{}";
        this.isActive = isActive != null ? isActive : true;
        this.createdByUser = createdByUser;
    }

    // Legacy constructor compatibility
    public RiskScoringRule(UUID id, String ruleCode, String category, String description,
                            String conditionField, String operator, String thresholdValue,
                            Double scoreWeight, Boolean isActive, Instant createdAt, Instant updatedAt) {
        this.ruleId = id;
        this.ruleCode = ruleCode;
        this.ruleVersion = ruleCode != null ? ruleCode : "v1.0-" + UUID.randomUUID().toString().substring(0, 5);
        this.ruleName = description != null ? description : (ruleCode != null ? ruleCode : "Custom Rule");
        this.category = category;
        this.description = description;
        this.conditionField = conditionField;
        this.operator = operator;
        this.thresholdValue = thresholdValue;
        this.scoreWeight = scoreWeight != null ? scoreWeight : 1.0;
        this.isActive = isActive != null ? isActive : true;
        this.parameters = String.format("{\"weights\": {\"%s\": %s}}", conditionField != null ? conditionField : "score", scoreWeight != null ? scoreWeight : 1.0);
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
        if (updatedAt != null) this.updatedAt = updatedAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getRuleId() { return ruleId; }
    public void setRuleId(UUID ruleId) { this.ruleId = ruleId; }

    public UUID getId() { return ruleId; }
    public void setId(UUID id) { this.ruleId = id; }

    public String getRuleVersion() { return ruleVersion; }
    public void setRuleVersion(String ruleVersion) { this.ruleVersion = ruleVersion; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getParameters() { return parameters; }
    public void setParameters(String parameters) { this.parameters = parameters; }

    public Boolean getIsActive() { return isActive; }
    public Boolean isActive() { return isActive; }
    public Boolean getActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public User getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(User createdByUser) { this.createdByUser = createdByUser; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    // Compatibility getters & setters
    public String getRuleCode() { return ruleCode != null ? ruleCode : ruleVersion; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; this.ruleVersion = ruleCode; }

    public String getCategory() { return category != null ? category : "GENERAL"; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description != null ? description : ruleName; }
    public void setDescription(String description) { this.description = description; this.ruleName = description; }

    public String getConditionField() { return conditionField != null ? conditionField : "age"; }
    public void setConditionField(String conditionField) { this.conditionField = conditionField; }

    public String getOperator() { return operator != null ? operator : "EQUALS"; }
    public void setOperator(String operator) { this.operator = operator; }

    public String getThresholdValue() { return thresholdValue != null ? thresholdValue : "0"; }
    public void setThresholdValue(String thresholdValue) { this.thresholdValue = thresholdValue; }

    public Double getScoreWeight() { return scoreWeight; }
    public void setScoreWeight(Double scoreWeight) { this.scoreWeight = scoreWeight; }

    public Instant getUpdatedAt() { return updatedAt != null ? updatedAt.toInstant() : null; }
    public void setUpdatedAt(Instant updatedAt) {
        if (updatedAt != null) this.updatedAt = updatedAt.atOffset(ZoneOffset.UTC);
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String ruleCode;
        private String category;
        private String description;
        private String conditionField;
        private String operator;
        private String thresholdValue;
        private Double scoreWeight;
        private Boolean isActive = true;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder ruleCode(String ruleCode) { this.ruleCode = ruleCode; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder conditionField(String conditionField) { this.conditionField = conditionField; return this; }
        public Builder operator(String operator) { this.operator = operator; return this; }
        public Builder thresholdValue(String thresholdValue) { this.thresholdValue = thresholdValue; return this; }
        public Builder scoreWeight(Double scoreWeight) { this.scoreWeight = scoreWeight; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public RiskScoringRule build() {
            return new RiskScoringRule(id, ruleCode, category, description, conditionField,
                    operator, thresholdValue, scoreWeight, isActive, Instant.now(), Instant.now());
        }
    }
}
