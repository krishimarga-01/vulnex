package com.extremeweather.controller;

import com.extremeweather.dto.ApiResponse;
import com.extremeweather.dto.ShelterResponse;
import com.extremeweather.entity.Shelter;
import com.extremeweather.geography.SpatialUtils;
import com.extremeweather.repository.ShelterRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/shelters")
@Tag(name = "Shelters & Evacuation Centers", description = "Endpoints for finding and viewing emergency shelters")
public class ShelterController {

    private final ShelterRepository shelterRepository;

    public ShelterController(ShelterRepository shelterRepository) {
        this.shelterRepository = shelterRepository;
    }

    @GetMapping
    @Operation(summary = "List all active emergency shelters")
    public ResponseEntity<ApiResponse<List<ShelterResponse>>> getAllShelters(
            @RequestParam(required = false) String district) {
        List<Shelter> list;
        if (district != null && !district.isBlank()) {
            list = shelterRepository.findByDistrictIgnoreCase(district);
        } else {
            list = shelterRepository.findAll();
        }
        List<ShelterResponse> responses = list.stream().map(ShelterResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find emergency shelters within radius of GPS location")
    public ResponseEntity<ApiResponse<List<ShelterResponse>>> getNearbyShelters(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "50.0") double radiusKm) {
        List<Shelter> all = shelterRepository.findAll();
        List<ShelterResponse> nearby = all.stream()
                .filter(s -> {
                    if (s.getLatitude() == null || s.getLongitude() == null) return false;
                    return SpatialUtils.isWithinRadius(
                            latitude, longitude,
                            s.getLatitude().doubleValue(), s.getLongitude().doubleValue(),
                            radiusKm
                    );
                })
                .map(ShelterResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(nearby));
    }
}
