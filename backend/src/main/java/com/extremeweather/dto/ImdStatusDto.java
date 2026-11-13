package com.extremeweather.dto;

import java.time.OffsetDateTime;

public class ImdStatusDto {
    private boolean isMonitoringActive;
    private OffsetDateTime lastCheckedTime;
    private OffsetDateTime nextScheduledPollTime;
    private int activeWarningsCount;
    private int monitoredDistrictsCount;
    private String officialSource;
    private String monitoringInterval;

    public ImdStatusDto() {}

    public ImdStatusDto(boolean isMonitoringActive, OffsetDateTime lastCheckedTime, OffsetDateTime nextScheduledPollTime,
                        int activeWarningsCount, int monitoredDistrictsCount, String officialSource, String monitoringInterval) {
        this.isMonitoringActive = isMonitoringActive;
        this.lastCheckedTime = lastCheckedTime;
        this.nextScheduledPollTime = nextScheduledPollTime;
        this.activeWarningsCount = activeWarningsCount;
        this.monitoredDistrictsCount = monitoredDistrictsCount;
        this.officialSource = officialSource;
        this.monitoringInterval = monitoringInterval;
    }

    public boolean isMonitoringActive() { return isMonitoringActive; }
    public void setMonitoringActive(boolean monitoringActive) { isMonitoringActive = monitoringActive; }

    public OffsetDateTime getLastCheckedTime() { return lastCheckedTime; }
    public void setLastCheckedTime(OffsetDateTime lastCheckedTime) { this.lastCheckedTime = lastCheckedTime; }

    public OffsetDateTime getNextScheduledPollTime() { return nextScheduledPollTime; }
    public void setNextScheduledPollTime(OffsetDateTime nextScheduledPollTime) { this.nextScheduledPollTime = nextScheduledPollTime; }

    public int getActiveWarningsCount() { return activeWarningsCount; }
    public void setActiveWarningsCount(int activeWarningsCount) { this.activeWarningsCount = activeWarningsCount; }

    public int getMonitoredDistrictsCount() { return monitoredDistrictsCount; }
    public void setMonitoredDistrictsCount(int monitoredDistrictsCount) { this.monitoredDistrictsCount = monitoredDistrictsCount; }

    public String getOfficialSource() { return officialSource; }
    public void setOfficialSource(String officialSource) { this.officialSource = officialSource; }

    public String getMonitoringInterval() { return monitoringInterval; }
    public void setMonitoringInterval(String monitoringInterval) { this.monitoringInterval = monitoringInterval; }
}
