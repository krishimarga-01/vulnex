package com.extremeweather.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public class RiskScoreRuleDto {

    private Long id;

    @NotBlank(message = "Rule code is required")
    private String ruleCode;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Condition field is required")
    private String conditionField;

    @NotBlank(message = "Operator is required")
    private String operator;

    @NotBlank(message = "Threshold value is required")
    private String thresholdValue;

    @NotNull(message = "Score weight is required")
    private Double scoreWeight;

    private Boolean isActive = true;

    public RiskScoreRuleDto() {}


    public RiskScoreRuleDto(Long id, String ruleCode, String category, String description, String conditionField, String operator, String thresholdValue, Double scoreWeight, Boolean isActive) {
        this.id = id;
        this.ruleCode = ruleCode;
        this.category = category;
        this.description = description;
        this.conditionField = conditionField;
        this.operator = operator;
        this.thresholdValue = thresholdValue;
        this.scoreWeight = scoreWeight;
        this.isActive = isActive;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getConditionField() { return conditionField; }
    public void setConditionField(String conditionField) { this.conditionField = conditionField; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(String thresholdValue) { this.thresholdValue = thresholdValue; }
    public Double getScoreWeight() { return scoreWeight; }
    public void setScoreWeight(Double scoreWeight) { this.scoreWeight = scoreWeight; }
    public Boolean getIsActive() { return isActive; }
    public Boolean isActive() { return isActive; }
    public Boolean getActive() { return isActive; }
    public Boolean isIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String ruleCode;
        private String category;
        private String description;
        private String conditionField;
        private String operator;
        private String thresholdValue;
        private Double scoreWeight;
        private Boolean isActive = true;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder ruleCode(String ruleCode) { this.ruleCode = ruleCode; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder conditionField(String conditionField) { this.conditionField = conditionField; return this; }
        public Builder operator(String operator) { this.operator = operator; return this; }
        public Builder thresholdValue(String thresholdValue) { this.thresholdValue = thresholdValue; return this; }
        public Builder scoreWeight(Double scoreWeight) { this.scoreWeight = scoreWeight; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public RiskScoreRuleDto build() {
            return new RiskScoreRuleDto(id, ruleCode, category, description, conditionField, operator, thresholdValue, scoreWeight, isActive);
        }
    }

}
