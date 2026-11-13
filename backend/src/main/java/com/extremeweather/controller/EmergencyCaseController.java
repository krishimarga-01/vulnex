package com.extremeweather.controller;

import com.extremeweather.dto.*;
import com.extremeweather.emergency.EmergencyCaseService;
import com.extremeweather.entity.CaseStatus;
import com.extremeweather.entity.EmergencyPriority;
import com.extremeweather.entity.ResponseTeam;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emergency-cases")
@Tag(name = "Emergency Case & Dispatch Management", description = "Endpoints for reporting, triaging, dispatching teams, and resolving emergency incidents")
public class EmergencyCaseController {

    private final EmergencyCaseService emergencyCaseService;

    @PostMapping
    @Operation(summary = "Submit a new emergency assistance request")
    public ResponseEntity<ApiResponse<EmergencyCaseResponse>> createCase(
            @Valid @RequestBody EmergencyCaseRequest request) {
        EmergencyCaseResponse response = emergencyCaseService.createEmergencyCase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Emergency case created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve emergency case details by ID")
    public ResponseEntity<ApiResponse<EmergencyCaseResponse>> getById(@PathVariable UUID id) {
        EmergencyCaseResponse response = emergencyCaseService.getCaseById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search emergency cases by status, priority, and keyword")
    public ResponseEntity<ApiResponse<Page<EmergencyCaseResponse>>> searchCases(
            @RequestParam(required = false) CaseStatus status,
            @RequestParam(required = false) EmergencyPriority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<EmergencyCaseResponse> pageResult = emergencyCaseService.searchCases(status, priority, search, page, size);
        return ResponseEntity.ok(ApiResponse.ok(pageResult));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    @Operation(summary = "List all unassigned pending emergency cases")
    public ResponseEntity<ApiResponse<List<EmergencyCaseResponse>>> getPendingCases() {
        List<EmergencyCaseResponse> list = emergencyCaseService.getPendingCases();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/high-priority")
    @Operation(summary = "List critical high-priority cases")
    public ResponseEntity<ApiResponse<List<EmergencyCaseResponse>>> getHighPriorityCases() {
        List<EmergencyCaseResponse> list = emergencyCaseService.getHighPriorityCases();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    @Operation(summary = "Assign a dedicated response team to an emergency case")
    public ResponseEntity<ApiResponse<EmergencyCaseResponse>> assignTeam(
            @PathVariable UUID id,
            @Valid @RequestBody EmergencyCaseAssignmentRequest request) {
        EmergencyCaseResponse response = emergencyCaseService.assignResponseTeam(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Response team assigned to case"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN', 'VOLUNTEER')")
    @Operation(summary = "Update emergency case status (VERIFIED, IN_PROGRESS, RESOLVED, CLOSED)")
    public ResponseEntity<ApiResponse<EmergencyCaseResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody EmergencyCaseStatusUpdateRequest request) {
        EmergencyCaseResponse response = emergencyCaseService.updateCaseStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Case status updated successfully"));
    }

    @GetMapping("/response-teams")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    @Operation(summary = "List available emergency response teams")
    public ResponseEntity<ApiResponse<List<ResponseTeam>>> getAvailableTeams() {
        List<ResponseTeam> teams = emergencyCaseService.getAvailableResponseTeams();
        return ResponseEntity.ok(ApiResponse.ok(teams));
    }

    public EmergencyCaseController(EmergencyCaseService emergencyCaseService) {
        this.emergencyCaseService = emergencyCaseService;
    }
}
