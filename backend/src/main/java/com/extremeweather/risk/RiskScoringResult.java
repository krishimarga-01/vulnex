package com.extremeweather.risk;

import com.extremeweather.entity.RiskLevel;
import java.util.List;

public class RiskScoringResult {
    private Double totalScore;
    private RiskLevel riskLevel;
    private List<ScoreBreakdownItem> breakdown;

    public RiskScoringResult() {}


    public RiskScoringResult(Double totalScore, RiskLevel riskLevel, List<ScoreBreakdownItem> breakdown) {
        this.totalScore = totalScore;
        this.riskLevel = riskLevel;
        this.breakdown = breakdown;
    }

    public Double getTotalScore() { return totalScore; }
    public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }
    public List<ScoreBreakdownItem> getBreakdown() { return breakdown; }
    public void setBreakdown(List<ScoreBreakdownItem> breakdown) { this.breakdown = breakdown; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Double totalScore;
        private RiskLevel riskLevel;
        private List<ScoreBreakdownItem> breakdown;
        public Builder totalScore(Double totalScore) { this.totalScore = totalScore; return this; }
        public Builder riskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; return this; }
        public Builder breakdown(List<ScoreBreakdownItem> breakdown) { this.breakdown = breakdown; return this; }
        public RiskScoringResult build() {
            return new RiskScoringResult(totalScore, riskLevel, breakdown);
        }
    }

}
