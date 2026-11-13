package com.extremeweather.controller;

import com.extremeweather.dto.*;
import com.extremeweather.service.ImdEarlyWarningService;
import com.extremeweather.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/weather")
@Tag(name = "Weather Monitoring & IMD Extreme Warnings", description = "Endpoints for weather observations, IMD Early Warning feeds, and multi-hazard alert management")
public class WeatherMonitoringController {

    private final WeatherService weatherService;
    private final ImdEarlyWarningService imdService;

    @GetMapping("/observations/region/{regionId}")
    @Operation(summary = "Query or trigger live weather observation for a geographical region")
    public ResponseEntity<ApiResponse<WeatherObservationDto>> getRegionWeather(@PathVariable UUID regionId) {
        WeatherObservationDto dto = weatherService.observeRegionWeather(regionId);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/alerts")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    @Operation(summary = "Publish an official weather warning (Red/Orange alert, Cyclone, Flood, Heatwave)")
    public ResponseEntity<ApiResponse<WeatherAlertResponse>> createAlert(
            @Valid @RequestBody WeatherAlertRequest request) {
        WeatherAlertResponse response = weatherService.createWeatherAlert(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Weather alert broadcasted and risk recalculation triggered"));
    }

    @GetMapping("/alerts/active")
    @Operation(summary = "Get list of all active weather warnings")
    public ResponseEntity<ApiResponse<List<WeatherAlertResponse>>> getActiveAlerts() {
        List<WeatherAlertResponse> alerts = weatherService.getActiveAlerts();
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get weather alert historical archive")
    public ResponseEntity<ApiResponse<List<WeatherAlertResponse>>> getAllAlerts() {
        List<WeatherAlertResponse> alerts = weatherService.getAllAlerts();
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }

    @PatchMapping("/alerts/{id}/deactivate")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    @Operation(summary = "Deactivate / expire an existing weather warning")
    public ResponseEntity<ApiResponse<WeatherAlertResponse>> deactivateAlert(@PathVariable UUID id) {
        WeatherAlertResponse response = weatherService.deactivateAlert(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Alert deactivated"));
    }

    // =========================================================================
    // VULNEX INDIA: OFFICIAL IMD EARLY WARNING SYSTEM ENDPOINTS
    // =========================================================================

    @GetMapping("/imd/warnings")
    @Operation(summary = "List all active official IMD district warnings with affected population counts")
    public ResponseEntity<ApiResponse<List<ImdWarningDto>>> getActiveImdWarnings() {
        List<ImdWarningDto> warnings = imdService.getActiveImdWarnings();
        return ResponseEntity.ok(ApiResponse.ok(warnings, "Official IMD district warnings retrieved"));
    }

    @GetMapping("/imd/district/{state}/{district}")
    @Operation(summary = "Retrieve targeted IMD warning for a specific Indian State & District (used by mobile app)")
    public ResponseEntity<ApiResponse<ImdWarningDto>> getDistrictWarning(
            @PathVariable String state,
            @PathVariable String district) {
        ImdWarningDto warning = imdService.getWarningForDistrict(state, district);
        return ResponseEntity.ok(ApiResponse.ok(warning, "District IMD alert retrieved"));
    }

    @GetMapping("/imd/status")
    @Operation(summary = "Get centralized IMD Early Warning monitoring service status and polling schedule")
    public ResponseEntity<ApiResponse<ImdStatusDto>> getImdStatus() {
        ImdStatusDto status = imdService.getMonitoringStatus();
        return ResponseEntity.ok(ApiResponse.ok(status, "IMD monitoring status retrieved"));
    }

    @PostMapping("/imd/sync")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    @Operation(summary = "Trigger immediate manual synchronization with official IMD warning portal")
    public ResponseEntity<ApiResponse<List<ImdWarningDto>>> syncImdNow() {
        List<ImdWarningDto> updated = imdService.syncImdBulletinsNow();
        return ResponseEntity.ok(ApiResponse.ok(updated, "IMD warning bulletins successfully synchronized"));
    }

    public WeatherMonitoringController(WeatherService weatherService, ImdEarlyWarningService imdService) {
        this.weatherService = weatherService;
        this.imdService = imdService;
    }
}
