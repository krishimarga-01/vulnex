package com.extremeweather.risk;

public class ScoreBreakdownItem {
    private String ruleCode;
    private String category;
    private Double pointsAdded;
    private String explanation;

    public ScoreBreakdownItem() {}


    public ScoreBreakdownItem(String ruleCode, String category, Double pointsAdded, String explanation) {
        this.ruleCode = ruleCode;
        this.category = category;
        this.pointsAdded = pointsAdded;
        this.explanation = explanation;
    }

    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getPointsAdded() { return pointsAdded; }
    public void setPointsAdded(Double pointsAdded) { this.pointsAdded = pointsAdded; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String ruleCode;
        private String category;
        private Double pointsAdded;
        private String explanation;
        public Builder ruleCode(String ruleCode) { this.ruleCode = ruleCode; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder pointsAdded(Double pointsAdded) { this.pointsAdded = pointsAdded; return this; }
        public Builder explanation(String explanation) { this.explanation = explanation; return this; }
        public ScoreBreakdownItem build() {
            return new ScoreBreakdownItem(ruleCode, category, pointsAdded, explanation);
        }
    }

}
