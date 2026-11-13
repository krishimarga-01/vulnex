package com.extremeweather.dto;

import java.util.List;
import java.util.Map;

public class DashboardSummaryResponse {

    private long totalVulnerablePeople;
    private long highRiskCount;
    private long mediumRiskCount;
    private long lowRiskCount;

    private long activeAlertsCount;
    private long totalEmergencyCases;
    private long pendingCasesCount;
    private long inProgressCasesCount;
    private long resolvedCasesCount;

    private Map<String, Long> vulnerableByCategory;
    private List<EmergencyCaseResponse> recentEmergencyCases;
    private List<WeatherAlertResponse> activeAlerts;

    public DashboardSummaryResponse() {}


    public DashboardSummaryResponse(long totalVulnerablePeople, long highRiskCount, long mediumRiskCount, long lowRiskCount, long activeAlertsCount, long totalEmergencyCases, long pendingCasesCount, long inProgressCasesCount, long resolvedCasesCount, Map<String, Long> vulnerableByCategory, List<EmergencyCaseResponse> recentEmergencyCases, List<WeatherAlertResponse> activeAlerts) {
        this.totalVulnerablePeople = totalVulnerablePeople;
        this.highRiskCount = highRiskCount;
        this.mediumRiskCount = mediumRiskCount;
        this.lowRiskCount = lowRiskCount;
        this.activeAlertsCount = activeAlertsCount;
        this.totalEmergencyCases = totalEmergencyCases;
        this.pendingCasesCount = pendingCasesCount;
        this.inProgressCasesCount = inProgressCasesCount;
        this.resolvedCasesCount = resolvedCasesCount;
        this.vulnerableByCategory = vulnerableByCategory;
        this.recentEmergencyCases = recentEmergencyCases;
        this.activeAlerts = activeAlerts;
    }

    public long getTotalVulnerablePeople() { return totalVulnerablePeople; }
    public void setTotalVulnerablePeople(long totalVulnerablePeople) { this.totalVulnerablePeople = totalVulnerablePeople; }
    public long getHighRiskCount() { return highRiskCount; }
    public void setHighRiskCount(long highRiskCount) { this.highRiskCount = highRiskCount; }
    public long getMediumRiskCount() { return mediumRiskCount; }
    public void setMediumRiskCount(long mediumRiskCount) { this.mediumRiskCount = mediumRiskCount; }
    public long getLowRiskCount() { return lowRiskCount; }
    public void setLowRiskCount(long lowRiskCount) { this.lowRiskCount = lowRiskCount; }
    public long getActiveAlertsCount() { return activeAlertsCount; }
    public void setActiveAlertsCount(long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; }
    public long getTotalEmergencyCases() { return totalEmergencyCases; }
    public void setTotalEmergencyCases(long totalEmergencyCases) { this.totalEmergencyCases = totalEmergencyCases; }
    public long getPendingCasesCount() { return pendingCasesCount; }
    public void setPendingCasesCount(long pendingCasesCount) { this.pendingCasesCount = pendingCasesCount; }
    public long getInProgressCasesCount() { return inProgressCasesCount; }
    public void setInProgressCasesCount(long inProgressCasesCount) { this.inProgressCasesCount = inProgressCasesCount; }
    public long getResolvedCasesCount() { return resolvedCasesCount; }
    public void setResolvedCasesCount(long resolvedCasesCount) { this.resolvedCasesCount = resolvedCasesCount; }
    public Map<String, Long> getVulnerableByCategory() { return vulnerableByCategory; }
    public void setVulnerableByCategory(Map<String, Long> vulnerableByCategory) { this.vulnerableByCategory = vulnerableByCategory; }
    public List<EmergencyCaseResponse> getRecentEmergencyCases() { return recentEmergencyCases; }
    public void setRecentEmergencyCases(List<EmergencyCaseResponse> recentEmergencyCases) { this.recentEmergencyCases = recentEmergencyCases; }
    public List<WeatherAlertResponse> getActiveAlerts() { return activeAlerts; }
    public void setActiveAlerts(List<WeatherAlertResponse> activeAlerts) { this.activeAlerts = activeAlerts; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private long totalVulnerablePeople;
        private long highRiskCount;
        private long mediumRiskCount;
        private long lowRiskCount;
        private long activeAlertsCount;
        private long totalEmergencyCases;
        private long pendingCasesCount;
        private long inProgressCasesCount;
        private long resolvedCasesCount;
        private Map<String, Long> vulnerableByCategory;
        private List<EmergencyCaseResponse> recentEmergencyCases;
        private List<WeatherAlertResponse> activeAlerts;
        public Builder totalVulnerablePeople(long totalVulnerablePeople) { this.totalVulnerablePeople = totalVulnerablePeople; return this; }
        public Builder highRiskCount(long highRiskCount) { this.highRiskCount = highRiskCount; return this; }
        public Builder mediumRiskCount(long mediumRiskCount) { this.mediumRiskCount = mediumRiskCount; return this; }
        public Builder lowRiskCount(long lowRiskCount) { this.lowRiskCount = lowRiskCount; return this; }
        public Builder activeAlertsCount(long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; return this; }
        public Builder totalEmergencyCases(long totalEmergencyCases) { this.totalEmergencyCases = totalEmergencyCases; return this; }
        public Builder pendingCasesCount(long pendingCasesCount) { this.pendingCasesCount = pendingCasesCount; return this; }
        public Builder inProgressCasesCount(long inProgressCasesCount) { this.inProgressCasesCount = inProgressCasesCount; return this; }
        public Builder resolvedCasesCount(long resolvedCasesCount) { this.resolvedCasesCount = resolvedCasesCount; return this; }
        public Builder vulnerableByCategory(Map<String, Long> vulnerableByCategory) { this.vulnerableByCategory = vulnerableByCategory; return this; }
        public Builder recentEmergencyCases(List<EmergencyCaseResponse> recentEmergencyCases) { this.recentEmergencyCases = recentEmergencyCases; return this; }
        public Builder activeAlerts(List<WeatherAlertResponse> activeAlerts) { this.activeAlerts = activeAlerts; return this; }
        public DashboardSummaryResponse build() {
            return new DashboardSummaryResponse(totalVulnerablePeople, highRiskCount, mediumRiskCount, lowRiskCount, activeAlertsCount, totalEmergencyCases, pendingCasesCount, inProgressCasesCount, resolvedCasesCount, vulnerableByCategory, recentEmergencyCases, activeAlerts);
        }
    }

}
