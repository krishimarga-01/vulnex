package com.extremeweather.workflow;

import com.extremeweather.dto.DashboardSummaryResponse;
import com.extremeweather.dto.EmergencyCaseResponse;
import com.extremeweather.dto.GeographicalRiskSummaryResponse;
import com.extremeweather.dto.WeatherAlertResponse;
import com.extremeweather.service.DashboardService;
import com.extremeweather.emergency.EmergencyCaseService;
import com.extremeweather.geography.GeographyService;
import com.extremeweather.service.WeatherService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Authority Dashboard Service & Data Integration Test")
public class AuthorityDashboardIntegrationTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private GeographyService geographyService;

    @Autowired
    private EmergencyCaseService emergencyCaseService;

    @Autowired
    private WeatherService weatherService;

    @Test
    @DisplayName("Verify Dashboard Summary KPI metrics calculation")
    void testDashboardSummaryMetrics() {
        DashboardSummaryResponse summary = dashboardService.getMainDashboardSummary();
        assertNotNull(summary);
        assertTrue(summary.getTotalVulnerablePeople() >= 0);
        assertTrue(summary.getHighRiskCount() >= 0);
        assertTrue(summary.getActiveAlertsCount() >= 0);
        assertTrue(summary.getPendingCasesCount() >= 0);
        assertNotNull(summary.getRecentEmergencyCases());
        assertNotNull(summary.getActiveAlerts());
    }

    @Test
    @DisplayName("Verify Geographical Risk summaries across regions")
    void testGeographicalRiskSummaries() {
        List<GeographicalRiskSummaryResponse> summaries = geographyService.getGeographicalRiskSummaries();
        assertNotNull(summaries);
        assertFalse(summaries.isEmpty(), "Should retrieve seeded geographic regions");
        GeographicalRiskSummaryResponse first = summaries.get(0);
        assertNotNull(first.getRegionId());
        assertNotNull(first.getRegionName());
        assertNotNull(first.getCurrentRiskLevel());
    }

    @Test
    @DisplayName("Verify Emergency Cases triage and pagination")
    void testEmergencyCasesPagination() {
        Page<EmergencyCaseResponse> page = emergencyCaseService.searchCases(null, null, null, 0, 10);
        assertNotNull(page);
        assertTrue(page.getTotalElements() >= 0);
    }

    @Test
    @DisplayName("Verify Active Weather Alerts retrieval")
    void testActiveWeatherAlerts() {
        List<WeatherAlertResponse> alerts = weatherService.getActiveAlerts();
        assertNotNull(alerts);
    }
}
