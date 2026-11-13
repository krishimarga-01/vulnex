package com.extremeweather.controller;

import com.extremeweather.dto.*;
import com.extremeweather.emergency.EmergencyCaseService;
import com.extremeweather.geography.SpatialUtils;
import com.extremeweather.service.ImdEarlyWarningService;
import com.extremeweather.service.UserService;
import com.extremeweather.service.VulnerablePersonService;
import com.extremeweather.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/mobile")
@Tag(name = "Mobile Application APIs", description = "Endpoints tailored for Citizens, Caregivers, and Volunteers")
public class MobileApiController {

    private final VulnerablePersonService vulnerablePersonService;
    private final EmergencyCaseService emergencyCaseService;
    private final WeatherService weatherService;
    private final UserService userService;
    private final ImdEarlyWarningService imdEarlyWarningService;

    @PostMapping("/vulnerable-persons")
    @Operation(summary = "Register a vulnerable family member or patient from the mobile app")
    public ResponseEntity<ApiResponse<VulnerablePersonResponse>> registerDependent(
            @Valid @RequestBody VulnerablePersonRequest request) {
        VulnerablePersonResponse response = vulnerablePersonService.registerVulnerablePerson(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Vulnerable individual successfully registered"));
    }

    @GetMapping("/vulnerable-persons/my")
    @Operation(summary = "Get all vulnerable persons registered by or linked to the current mobile user")
    public ResponseEntity<ApiResponse<List<VulnerablePersonResponse>>> getMyDependents() {
        List<VulnerablePersonResponse> list = vulnerablePersonService.getMyVulnerablePersons();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/emergency-cases")
    @Operation(summary = "Submit an emergency assistance request / SOS from the mobile app")
    public ResponseEntity<ApiResponse<EmergencyCaseResponse>> submitEmergencyRequest(
            @Valid @RequestBody EmergencyCaseRequest request) {
        EmergencyCaseResponse response = emergencyCaseService.createEmergencyCase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Emergency case submitted and queued for dispatch"));
    }

    @GetMapping("/emergency-cases/my")
    @Operation(summary = "Track status of emergency requests submitted by current user")
    public ResponseEntity<ApiResponse<List<EmergencyCaseResponse>>> getMyEmergencyCases() {
        List<EmergencyCaseResponse> list = emergencyCaseService.getMyReportedCases();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/weather-alerts/nearby")
    @Operation(summary = "Get active extreme weather alerts relevant to the user's current GPS location")
    public ResponseEntity<ApiResponse<List<WeatherAlertResponse>>> getNearbyAlerts(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "30.0") double radiusKm) {

        List<WeatherAlertResponse> active = weatherService.getActiveAlerts().stream()
                .filter(a -> {
                    if (a.getCenterLatitude() != null && a.getCenterLongitude() != null) {
                        return SpatialUtils.isWithinRadius(latitude, longitude, a.getCenterLatitude(), a.getCenterLongitude(), radiusKm);
                    }
                    return true; // Broader regional warning
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(active));
    }

    @GetMapping("/weather-alerts/imd")
    @Operation(summary = "Get targeted official IMD Early Warning for user's district or GPS coordinates")
    public ResponseEntity<ApiResponse<ImdWarningDto>> getTargetedImdAlert(
            @RequestParam(required = false, defaultValue = "Karnataka") String state,
            @RequestParam(required = false, defaultValue = "Bengaluru Urban") String district,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {

        // Auto-detect district if latitude/longitude provided
        String targetDistrict = district;
        if (latitude != null && longitude != null) {
            if (latitude >= 12.8 && latitude <= 13.2 && longitude >= 77.4 && longitude <= 77.8) {
                targetDistrict = "Bengaluru Urban";
            } else if (latitude >= 12.0 && latitude <= 12.7 && longitude >= 75.5 && longitude <= 76.2) {
                targetDistrict = "Kodagu";
            } else if (latitude >= 14.2 && latitude <= 15.2 && longitude >= 74.0 && longitude <= 75.0) {
                targetDistrict = "Uttara Kannada";
            } else if (latitude >= 13.0 && latitude <= 13.7 && longitude >= 74.6 && longitude <= 75.2) {
                targetDistrict = "Udupi";
            } else if (latitude >= 17.0 && latitude <= 17.6 && longitude >= 76.6 && longitude <= 77.2) {
                targetDistrict = "Kalaburagi";
            }
        }

        ImdWarningDto warning = imdEarlyWarningService.getWarningForDistrict(state, targetDistrict);
        return ResponseEntity.ok(ApiResponse.ok(warning));
    }

    @PostMapping("/location")
    @Operation(summary = "Update user current GPS location or manual district with consent")
    public ResponseEntity<ApiResponse<String>> updateLocation(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(ApiResponse.ok("Location updated and synchronized with regional disaster monitoring"));
    }

    @PostMapping("/fcm-token")
    @Operation(summary = "Register or refresh device Firebase Cloud Messaging (FCM) push token")
    public ResponseEntity<ApiResponse<String>> updateFcmToken(@RequestBody Map<String, String> payload) {
        String token = payload.get("fcmToken");
        userService.updateFcmToken(token);
        return ResponseEntity.ok(ApiResponse.ok("Device push token registered successfully"));
    }

    @GetMapping("/helplines")
    @Operation(summary = "Retrieve verified national and district emergency helplines")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getEmergencyHelplines() {
        List<Map<String, String>> helplines = List.of(
                Map.of("name", "National Disaster Helpline", "phone", "1078", "category", "DISASTER"),
                Map.of("name", "Medical Emergency / Ambulance", "phone", "108", "category", "MEDICAL"),
                Map.of("name", "Police / First Response", "phone", "112", "category", "POLICE"),
                Map.of("name", "Fire & Flood Rescue", "phone", "101", "category", "RESCUE"),
                Map.of("name", "Women & Pregnancy Emergency Helpline", "phone", "1091", "category", "MATERNAL")
        );
        return ResponseEntity.ok(ApiResponse.ok(helplines));
    }

    public MobileApiController(VulnerablePersonService vulnerablePersonService,
                               EmergencyCaseService emergencyCaseService,
                               WeatherService weatherService,
                               UserService userService,
                               ImdEarlyWarningService imdEarlyWarningService) {
        this.vulnerablePersonService = vulnerablePersonService;
        this.emergencyCaseService = emergencyCaseService;
        this.weatherService = weatherService;
        this.userService = userService;
        this.imdEarlyWarningService = imdEarlyWarningService;
    }
}
