package com.extremeweather.geography;

import com.extremeweather.dto.GeoJsonFeature;
import com.extremeweather.dto.GeoJsonFeatureCollection;
import com.extremeweather.dto.GeographicalRiskSummaryResponse;
import com.extremeweather.entity.GeographicalRegion;
import com.extremeweather.entity.RiskLevel;
import com.extremeweather.entity.VulnerablePerson;
import com.extremeweather.exception.ResourceNotFoundException;
import com.extremeweather.repository.GeographicalRegionRepository;
import com.extremeweather.repository.VulnerablePersonRepository;
import com.extremeweather.repository.WeatherAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeographyService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GeographyService.class);

    private final GeographicalRegionRepository regionRepository;
    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final WeatherAlertRepository weatherAlertRepository;

    @Transactional(readOnly = true)
    public List<GeographicalRegion> getAllRegions() {
        return regionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public GeographicalRegion getRegionById(UUID id) {
        return regionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Geographical region not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<GeographicalRiskSummaryResponse> getGeographicalRiskSummaries() {
        List<GeographicalRegion> regions = regionRepository.findAll();
        List<VulnerablePerson> allPersons = vulnerablePersonRepository.findAll();

        return regions.stream().map(region -> {
            // Count vulnerable people within 15km of region center
            List<VulnerablePerson> nearbyPersons = allPersons.stream()
                    .filter(p -> SpatialUtils.isWithinRadius(
                            p.getLatitude(), p.getLongitude(),
                            region.getCenterLatitude(), region.getCenterLongitude(), 15.0))
                    .toList();

            long highRiskCount = nearbyPersons.stream()
                    .filter(p -> p.getCurrentRiskLevel() == RiskLevel.HIGH)
                    .count();

            // Derive dynamic risk color and level
            String riskColor;
            RiskLevel calculatedLevel = region.getCurrentRiskLevel();
            if (calculatedLevel == RiskLevel.HIGH || highRiskCount > 5 || region.getActiveAlertCount() > 0) {
                riskColor = "RED";
                calculatedLevel = RiskLevel.HIGH;
            } else if (calculatedLevel == RiskLevel.MEDIUM || highRiskCount > 0) {
                riskColor = "ORANGE";
                calculatedLevel = RiskLevel.MEDIUM;
            } else {
                riskColor = "GREEN";
                calculatedLevel = RiskLevel.LOW;
            }

            return GeographicalRiskSummaryResponse.builder()
                    .regionId(region.getId())
                    .regionName(region.getName())
                    .regionCode(region.getRegionCode())
                    .regionType(region.getRegionType())
                    .centerLatitude(region.getCenterLatitude())
                    .centerLongitude(region.getCenterLongitude())
                    .currentRiskLevel(calculatedLevel)
                    .activeAlertCount(region.getActiveAlertCount())
                    .totalPopulation(region.getPopulation())
                    .vulnerableCount((long) nearbyPersons.size())
                    .highRiskVulnerableCount(highRiskCount)
                    .riskColor(riskColor)
                    .activeHazards(region.getActiveAlertCount() > 0 ? List.of("ACTIVE_WEATHER_WARNING") : Collections.emptyList())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GeoJsonFeatureCollection getVulnerablePopulationGeoJson(RiskLevel riskFilter) {
        List<VulnerablePerson> persons = vulnerablePersonRepository.findAll();
        List<GeoJsonFeature> features = new ArrayList<>();

        for (VulnerablePerson p : persons) {
            if (riskFilter != null && p.getCurrentRiskLevel() != riskFilter) {
                continue;
            }

            Map<String, Object> props = new HashMap<>();
            props.put("id", p.getId() != null ? p.getId().toString() : "");
            props.put("fullName", p.getFullName());
            props.put("age", p.getAge());
            props.put("category", p.getVulnerabilityCategory().name());
            props.put("mobilityStatus", p.getMobilityStatus().name());
            props.put("riskLevel", p.getCurrentRiskLevel().name());
            props.put("riskScore", p.getCurrentRiskScore());
            props.put("hasCaregiver", p.getCaregiver() != null);
            props.put("verificationStatus", p.getVerificationStatus());
            props.put("color", p.getCurrentRiskLevel() == RiskLevel.HIGH ? "#E53E3E" :
                    p.getCurrentRiskLevel() == RiskLevel.MEDIUM ? "#ED8936" : "#38A169");

            features.add(GeoJsonFeature.builder()
                    .type("Feature")
                    .geometry(SpatialUtils.createPointGeometry(p.getLatitude(), p.getLongitude()))
                    .properties(props)
                    .build());
        }

        return GeoJsonFeatureCollection.builder()
                .type("FeatureCollection")
                .features(features)
                .build();
    }

    public GeographyService(GeographicalRegionRepository regionRepository,
                            VulnerablePersonRepository vulnerablePersonRepository,
                            WeatherAlertRepository weatherAlertRepository) {
        this.regionRepository = regionRepository;
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.weatherAlertRepository = weatherAlertRepository;
    }
}
