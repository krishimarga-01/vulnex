package com.extremeweather.controller;

import com.extremeweather.dto.ApiResponse;
import com.extremeweather.dto.GeoJsonFeatureCollection;
import com.extremeweather.dto.GeographicalRiskSummaryResponse;
import com.extremeweather.entity.GeographicalRegion;
import com.extremeweather.entity.RiskLevel;
import com.extremeweather.geography.GeographyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/geography")
@Tag(name = "Geographical Risk & PostGIS Mapping", description = "Endpoints providing GIS data, boundary checks, and GeoJSON outputs for authority maps")
public class GeographicalRiskController {

    private final GeographyService geographyService;

    @GetMapping("/regions")
    @Operation(summary = "List all administrative geographical regions (districts, municipalities, wards)")
    public ResponseEntity<ApiResponse<List<GeographicalRegion>>> getAllRegions() {
        List<GeographicalRegion> regions = geographyService.getAllRegions();
        return ResponseEntity.ok(ApiResponse.ok(regions));
    }

    @GetMapping("/risk-summary")
    @Operation(summary = "Get geographical risk summaries with dynamic risk levels (RED, ORANGE, GREEN)")
    public ResponseEntity<ApiResponse<List<GeographicalRiskSummaryResponse>>> getRiskSummaries() {
        List<GeographicalRiskSummaryResponse> summaries = geographyService.getGeographicalRiskSummaries();
        return ResponseEntity.ok(ApiResponse.ok(summaries));
    }

    @GetMapping("/vulnerable-geojson")
    @Operation(summary = "Export vulnerable population locations as standard GeoJSON FeatureCollection")
    public ResponseEntity<GeoJsonFeatureCollection> getVulnerableGeoJson(
            @RequestParam(required = false) RiskLevel riskLevel) {
        GeoJsonFeatureCollection featureCollection = geographyService.getVulnerablePopulationGeoJson(riskLevel);
        return ResponseEntity.ok(featureCollection);
    }

    public GeographicalRiskController(GeographyService geographyService) {
        this.geographyService = geographyService;
    }

}
