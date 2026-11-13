package com.extremeweather.controller;

import com.extremeweather.dto.ApiResponse;
import com.extremeweather.dto.RiskAssessmentResponse;
import com.extremeweather.dto.RiskScoreRuleDto;
import com.extremeweather.entity.RiskScoringRule;
import com.extremeweather.risk.RiskAssessmentEngine;
import com.extremeweather.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/risk")
@Tag(name = "Vulnerability Risk Assessment Engine", description = "Endpoints for transparent, explainable rule-based risk calculation and rule administration")
public class RiskAssessmentController {

    private final RiskAssessmentEngine riskAssessmentEngine;

    @PostMapping("/assess/{vulnerablePersonId}")
    @Operation(summary = "Calculate and explain composite vulnerability risk score for a person")
    public ResponseEntity<ApiResponse<RiskAssessmentResponse>> assessPerson(
            @PathVariable UUID vulnerablePersonId) {
        String username = SecurityUtils.getCurrentUsername();
        RiskAssessmentResponse response = riskAssessmentEngine.assessPerson(vulnerablePersonId, null, username);
        return ResponseEntity.ok(ApiResponse.ok(response, "Risk assessment calculated successfully"));
    }

    @GetMapping("/rules")
    @Operation(summary = "View current active scoring rules and their assigned weights")
    public ResponseEntity<ApiResponse<List<RiskScoringRule>>> getScoringRules() {
        List<RiskScoringRule> rules = riskAssessmentEngine.getAllRules();
        return ResponseEntity.ok(ApiResponse.ok(rules));
    }

    @PostMapping("/rules")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create or update transparent scoring rules and weight parameters (Admin only)")
    public ResponseEntity<ApiResponse<RiskScoringRule>> createOrUpdateRule(
            @Valid @RequestBody RiskScoreRuleDto dto) {
        RiskScoringRule rule = riskAssessmentEngine.createOrUpdateRule(dto);
        return ResponseEntity.ok(ApiResponse.ok(rule, "Risk scoring rule updated successfully"));
    }

    public RiskAssessmentController(RiskAssessmentEngine riskAssessmentEngine) {
        this.riskAssessmentEngine = riskAssessmentEngine;
    }
}
