package com.extremeweather.controller;

import com.extremeweather.dto.ApiResponse;
import com.extremeweather.dto.VulnerablePersonRequest;
import com.extremeweather.dto.VulnerablePersonResponse;
import com.extremeweather.dto.VulnerablePersonSearchCriteria;
import com.extremeweather.service.VulnerablePersonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vulnerable-persons")
@Tag(name = "Vulnerable Population Management", description = "Endpoints for registering, maintaining, and searching vulnerable individuals")
public class VulnerablePersonController {

    private final VulnerablePersonService vulnerablePersonService;

    @PostMapping
    @Operation(summary = "Register a new vulnerable person")
    public ResponseEntity<ApiResponse<VulnerablePersonResponse>> register(
            @Valid @RequestBody VulnerablePersonRequest request) {
        VulnerablePersonResponse response = vulnerablePersonService.registerVulnerablePerson(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Vulnerable person registered successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vulnerable person profile and medical requirements")
    public ResponseEntity<ApiResponse<VulnerablePersonResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody VulnerablePersonRequest request) {
        VulnerablePersonResponse response = vulnerablePersonService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Profile updated successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed vulnerable person profile (PII masked for non-authorities)")
    public ResponseEntity<ApiResponse<VulnerablePersonResponse>> getById(@PathVariable UUID id) {
        VulnerablePersonResponse response = vulnerablePersonService.getPersonById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search and filter vulnerable individuals by category, risk level, or text")
    public ResponseEntity<ApiResponse<Page<VulnerablePersonResponse>>> search(
            @ModelAttribute VulnerablePersonSearchCriteria criteria) {
        Page<VulnerablePersonResponse> response = vulnerablePersonService.searchPersons(criteria);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/radius")
    @Operation(summary = "Find vulnerable persons within radius (km) of geographical coordinates")
    public ResponseEntity<ApiResponse<List<VulnerablePersonResponse>>> getInRadius(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10.0") double radiusKm) {
        List<VulnerablePersonResponse> list = vulnerablePersonService.getPeopleInAffectedRegion(latitude, longitude, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/immediate-assistance")
    @Operation(summary = "Retrieve persons requiring immediate emergency attention")
    public ResponseEntity<ApiResponse<List<VulnerablePersonResponse>>> getImmediateAssistance() {
        List<VulnerablePersonResponse> list = vulnerablePersonService.getPeopleRequiringImmediateAssistance();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    public VulnerablePersonController(VulnerablePersonService vulnerablePersonService) {
        this.vulnerablePersonService = vulnerablePersonService;
    }
}
