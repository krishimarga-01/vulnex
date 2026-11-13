package com.extremeweather.controller;

import com.extremeweather.dto.*;
import com.extremeweather.emergency.EmergencyCaseService;
import com.extremeweather.entity.CaseStatus;
import com.extremeweather.entity.EmergencyPriority;
import com.extremeweather.entity.RiskLevel;
import com.extremeweather.geography.GeographyService;
import com.extremeweather.service.DashboardService;
import com.extremeweather.service.ImdEarlyWarningService;
import com.extremeweather.service.VulnerablePersonService;
import com.extremeweather.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authority/dashboard")
@PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
@Tag(name = "Authority Web Dashboard APIs", description = "Endpoints serving Disaster Management and Municipal Emergency Officials")
public class AuthorityDashboardController {

    private final DashboardService dashboardService;
    private final GeographyService geographyService;
    private final VulnerablePersonService vulnerablePersonService;
    private final EmergencyCaseService emergencyCaseService;
    private final WeatherService weatherService;
    private final ImdEarlyWarningService imdEarlyWarningService;
    private final com.extremeweather.service.ResponsePriorityService responsePriorityService;

    // SECTION A: MAIN DASHBOARD SUMMARY
    @GetMapping("/summary")
    @Operation(summary = "Get high-level disaster management situational summary metrics")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        DashboardSummaryResponse response = dashboardService.getMainDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // SECTION B: RISK MAP & GEOGRAPHICAL DATA
    @GetMapping("/risk-map/regions")
    @Operation(summary = "Get geographical risk distribution across districts and wards")
    public ResponseEntity<ApiResponse<List<GeographicalRiskSummaryResponse>>> getGeographicalRiskSummary() {
        List<GeographicalRiskSummaryResponse> summaries = geographyService.getGeographicalRiskSummaries();
        return ResponseEntity.ok(ApiResponse.ok(summaries));
    }

    @GetMapping("/risk-map/vulnerable-geojson")
    @Operation(summary = "Get GeoJSON FeatureCollection of vulnerable population coordinates for GIS mapping")
    public ResponseEntity<GeoJsonFeatureCollection> getVulnerableGeoJson(
            @RequestParam(required = false) RiskLevel riskLevel) {
        GeoJsonFeatureCollection geoJson = geographyService.getVulnerablePopulationGeoJson(riskLevel);
        return ResponseEntity.ok(geoJson);
    }

    // SECTION C: VULNERABLE PEOPLE MANAGEMENT
    @GetMapping("/vulnerable-people")
    @Operation(summary = "Search and filter vulnerable population with full authority unmasked access")
    public ResponseEntity<ApiResponse<Page<VulnerablePersonResponse>>> searchVulnerablePersons(
            @ModelAttribute VulnerablePersonSearchCriteria criteria) {
        Page<VulnerablePersonResponse> page = vulnerablePersonService.searchPersons(criteria);
        return ResponseEntity.ok(ApiResponse.ok(page));
    }

    // SECTION D: WEATHER & DISASTER ALERTS
    @GetMapping("/alerts")
    @Operation(summary = "Retrieve currently active weather and flood alerts")
    public ResponseEntity<ApiResponse<List<WeatherAlertResponse>>> getActiveAlerts() {
        List<WeatherAlertResponse> alerts = weatherService.getActiveAlerts();
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }

    // SECTION E: EMERGENCY CASE MANAGEMENT
    @GetMapping("/cases")
    @Operation(summary = "Search emergency cases with filters")
    public ResponseEntity<ApiResponse<Page<EmergencyCaseResponse>>> searchCases(
            @RequestParam(required = false) CaseStatus status,
            @RequestParam(required = false) EmergencyPriority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<EmergencyCaseResponse> pageResult = emergencyCaseService.searchCases(status, priority, search, page, size);
        return ResponseEntity.ok(ApiResponse.ok(pageResult));
    }

    @GetMapping("/cases/pending")
    @Operation(summary = "Retrieve unassigned pending SOS calls requiring triage")
    public ResponseEntity<ApiResponse<List<EmergencyCaseResponse>>> getPendingCases() {
        List<EmergencyCaseResponse> pending = emergencyCaseService.getPendingCases();
        return ResponseEntity.ok(ApiResponse.ok(pending));
    }

    @GetMapping("/cases/critical")
    @Operation(summary = "Retrieve critical high-priority emergency cases")
    public ResponseEntity<ApiResponse<List<EmergencyCaseResponse>>> getCriticalCases() {
        List<EmergencyCaseResponse> critical = emergencyCaseService.getHighPriorityCases();
        return ResponseEntity.ok(ApiResponse.ok(critical));
    }

    // SECTION F: IMD INDIA EARLY WARNING MONITORING
    @GetMapping("/imd-warnings")
    @Operation(summary = "Retrieve active official IMD warnings mapped to Indian districts and vulnerable populations")
    public ResponseEntity<ApiResponse<List<ImdWarningDto>>> getImdWarnings() {
        List<ImdWarningDto> warnings = imdEarlyWarningService.getActiveImdWarnings();
        return ResponseEntity.ok(ApiResponse.ok(warnings, "IMD active warnings retrieved"));
    }

    @GetMapping("/imd-status")
    @Operation(summary = "Get IMD monitoring status, last checked time, and next scheduled poll")
    public ResponseEntity<ApiResponse<ImdStatusDto>> getImdStatus() {
        ImdStatusDto status = imdEarlyWarningService.getMonitoringStatus();
        return ResponseEntity.ok(ApiResponse.ok(status, "IMD status retrieved"));
    }

    @PostMapping("/imd-sync")
    @Operation(summary = "Trigger immediate manual synchronization with official IMD warning bulletins")
    public ResponseEntity<ApiResponse<List<ImdWarningDto>>> syncImdNow() {
        List<ImdWarningDto> warnings = imdEarlyWarningService.syncImdBulletinsNow();
        return ResponseEntity.ok(ApiResponse.ok(warnings, "IMD warnings synchronized successfully"));
    }

    // SECTION G: VULNEX RESPONSE PRIORITY & ACTION PLAN ENGINE
    @GetMapping("/response-priority-plan")
    @Operation(summary = "Generate ranked disaster response priority and action plan for authorities")
    public ResponseEntity<ApiResponse<ResponsePriorityPlanResponse>> getResponsePriorityPlan(
            @RequestParam(required = false) String district) {
        ResponsePriorityPlanResponse plan = responsePriorityService.generatePriorityActionPlan(district);
        return ResponseEntity.ok(ApiResponse.ok(plan, "VULNEX Response Priority Plan generated"));
    }

    public AuthorityDashboardController(
            DashboardService dashboardService,
            GeographyService geographyService,
            VulnerablePersonService vulnerablePersonService,
            EmergencyCaseService emergencyCaseService,
            WeatherService weatherService,
            ImdEarlyWarningService imdEarlyWarningService,
            com.extremeweather.service.ResponsePriorityService responsePriorityService) {
        this.dashboardService = dashboardService;
        this.geographyService = geographyService;
        this.vulnerablePersonService = vulnerablePersonService;
        this.emergencyCaseService = emergencyCaseService;
        this.weatherService = weatherService;
        this.imdEarlyWarningService = imdEarlyWarningService;
        this.responsePriorityService = responsePriorityService;
    }
}
