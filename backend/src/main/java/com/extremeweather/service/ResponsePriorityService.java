package com.extremeweather.service;

import com.extremeweather.dto.ImdWarningDto;
import com.extremeweather.dto.ResponsePriorityPlanResponse;
import com.extremeweather.entity.*;
import com.extremeweather.geography.SpatialUtils;
import com.extremeweather.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResponsePriorityService {

    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final WeatherAlertRepository weatherAlertRepository;
    private final ResponseTeamRepository responseTeamRepository;
    private final ShelterRepository shelterRepository;
    private final ImdEarlyWarningService imdEarlyWarningService;

    public ResponsePriorityService(
            VulnerablePersonRepository vulnerablePersonRepository,
            EmergencyCaseRepository emergencyCaseRepository,
            WeatherAlertRepository weatherAlertRepository,
            ResponseTeamRepository responseTeamRepository,
            ShelterRepository shelterRepository,
            ImdEarlyWarningService imdEarlyWarningService) {
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.emergencyCaseRepository = emergencyCaseRepository;
        this.weatherAlertRepository = weatherAlertRepository;
        this.responseTeamRepository = responseTeamRepository;
        this.shelterRepository = shelterRepository;
        this.imdEarlyWarningService = imdEarlyWarningService;
    }

    @Transactional(readOnly = true)
    public ResponsePriorityPlanResponse generatePriorityActionPlan(String districtFilter) {
        ResponsePriorityPlanResponse response = new ResponsePriorityPlanResponse();
        response.setGeneratedAt(OffsetDateTime.now());

        // 1. Gather all active alerts (IMD + Local weather alerts)
        List<ImdWarningDto> imdWarnings = imdEarlyWarningService.getActiveImdWarnings();
        List<WeatherAlert> localAlerts = weatherAlertRepository.findByIsActiveTrue();
        response.setActiveWarningsCount(imdWarnings.size() + localAlerts.size());

        List<String> affectedDistricts = imdWarnings.stream()
                .map(ImdWarningDto::getDistrict)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        response.setAffectedDistricts(affectedDistricts);

        // 2. Fetch all vulnerable persons and active emergency cases
        List<VulnerablePerson> allPersons = vulnerablePersonRepository.findAll();
        List<EmergencyCase> activeCases = emergencyCaseRepository.findAll().stream()
                .filter(c -> c.getStatus() != CaseStatus.RESOLVED && c.getStatus() != CaseStatus.CLOSED)
                .collect(Collectors.toList());

        // 3. Fetch shelters and response teams
        List<Shelter> shelters = shelterRepository.findAll();
        List<ResponseTeam> allTeams = responseTeamRepository.findAll();
        List<ResponseTeam> availableTeams = allTeams.stream()
                .filter(t -> "AVAILABLE".equalsIgnoreCase(t.getCurrentAvailability()))
                .collect(Collectors.toList());
        response.setAvailableTeamsCount(availableTeams.size());

        long criticalCases = activeCases.stream()
                .filter(c -> c.getPriority() == EmergencyPriority.CRITICAL)
                .count();
        response.setCriticalCasesCount((int) criticalCases);

        // 4. Map active cases by affected person ID
        Map<UUID, EmergencyCase> personToCase = new HashMap<>();
        for (EmergencyCase c : activeCases) {
            if (c.getAffectedPerson() != null && c.getAffectedPerson().getId() != null) {
                personToCase.put(c.getAffectedPerson().getId(), c);
            }
        }

        // Filter persons by district if specified
        List<VulnerablePerson> candidatePersons = allPersons;
        if (districtFilter != null && !districtFilter.isBlank() && !"ALL".equalsIgnoreCase(districtFilter)) {
            candidatePersons = allPersons.stream()
                    .filter(p -> p.getDistrict() != null && p.getDistrict().equalsIgnoreCase(districtFilter))
                    .collect(Collectors.toList());
        }

        response.setTotalVulnerableInAffectedZones(candidatePersons.size());

        List<ResponsePriorityPlanResponse.PriorityItem> items = new ArrayList<>();

        for (VulnerablePerson p : candidatePersons) {
            ResponsePriorityPlanResponse.PriorityItem item = new ResponsePriorityPlanResponse.PriorityItem();
            item.setTargetPersonId(p.getId());
            item.setTargetPersonName(p.getFullName());
            item.setVulnerabilityCategory(p.getVulnerabilityCategory() != null ? p.getVulnerabilityCategory().name() : "GENERAL");
            item.setMobilityStatus(p.getMobilityStatus() != null ? p.getMobilityStatus().name() : "INDEPENDENT");
            item.setAge(p.getAge());
            item.setAddress(p.getAddress());
            item.setDistrict(p.getDistrict() != null ? p.getDistrict() : "Karnataka");
            item.setLatitude(p.getLatitude());
            item.setLongitude(p.getLongitude());

            List<String> reasons = new ArrayList<>();
            double score = 0.0;

            // Check for active SOS distress case
            EmergencyCase activeCase = personToCase.get(p.getId());
            if (activeCase != null) {
                item.setHasActiveSos(true);
                item.setActiveCaseId(activeCase.getId());
                item.setActiveCaseNumber(activeCase.getCaseNumber());
                item.setEmergencyCategory(activeCase.getEmergencyCategory() != null ? activeCase.getEmergencyCategory().name() : "RESCUE");
                item.setStatus(activeCase.getStatus().name());
                if (activeCase.getAssignedTeam() != null) {
                    item.setAssignedTeamId(activeCase.getAssignedTeam().getTeamId());
                    item.setAssignedTeamName(activeCase.getAssignedTeam().getTeamName());
                }

                score += 40.0;
                reasons.add("CRITICAL DISTRESS: Active SOS assistance request filed (Case #" + activeCase.getCaseNumber() + ")");
            } else {
                item.setHasActiveSos(false);
                item.setStatus("PENDING_APPROVAL");
            }

            // Hazard Proximity calculation
            Double minDistance = null;
            String matchingHazard = "General Weather Watch";
            String hazardSeverity = "MODERATE";

            for (ImdWarningDto imd : imdWarnings) {
                if (imd.getDistrict() != null && imd.getDistrict().equalsIgnoreCase(p.getDistrict())) {
                    matchingHazard = "IMD " + imd.getImdColorCode() + " Warning: " + imd.getWarningType();
                    hazardSeverity = imd.getSeverityLevel();
                    minDistance = 3.5; // Within district alert zone
                    break;
                }
            }

            for (WeatherAlert wa : localAlerts) {
                if (wa.getCenterLatitude() != null && wa.getCenterLongitude() != null && p.getLatitude() != null && p.getLongitude() != null) {
                    double dist = SpatialUtils.haversineDistanceKm(
                            p.getLatitude(), p.getLongitude(),
                            wa.getCenterLatitude(), wa.getCenterLongitude()
                    );
                    if (minDistance == null || dist < minDistance) {
                        minDistance = dist;
                        matchingHazard = wa.getHeadline() != null ? wa.getHeadline() : wa.getAlertType().name();
                        hazardSeverity = wa.getSeverity() != null ? wa.getSeverity().name() : "HIGH";
                    }
                }
            }

            item.setHazardName(matchingHazard);
            item.setHazardSeverity(hazardSeverity);
            item.setDistanceToHazardCenterKm(minDistance != null ? Math.round(minDistance * 10.0) / 10.0 : 5.0);

            if ("CRITICAL".equalsIgnoreCase(hazardSeverity) || "EXTREME".equalsIgnoreCase(hazardSeverity)) {
                score += 25.0;
                reasons.add("Located in path of CRITICAL meteorological hazard: " + matchingHazard);
            } else if ("SEVERE".equalsIgnoreCase(hazardSeverity) || "ORANGE".equalsIgnoreCase(hazardSeverity)) {
                score += 18.0;
                reasons.add("Covered by SEVERE warning zone: " + matchingHazard);
            } else {
                score += 10.0;
                reasons.add("Active regional weather advisory in district");
            }

            // Vulnerability factors
            if (p.getMobilityStatus() == MobilityStatus.BEDRIDDEN) {
                score += 25.0;
                reasons.add("Bedridden mobility status mandates stretcher ambulance / team transport");
            } else if (p.getMobilityStatus() == MobilityStatus.WHEELCHAIR) {
                score += 15.0;
                reasons.add("Wheelchair dependency requires ramp/accessible evacuation vehicle");
            } else if (p.getMobilityStatus() == MobilityStatus.ASSISTED) {
                score += 10.0;
                reasons.add("Assisted mobility requires personal support escort");
            }

            if (p.getVulnerabilityCategory() == VulnerabilityCategory.MEDICAL_ASSISTANCE) {
                score += 20.0;
                reasons.add("Medical support dependency: " + (p.getMedicalConditions() != null ? p.getMedicalConditions() : "Essential care"));
            } else if (p.getVulnerabilityCategory() == VulnerabilityCategory.DISABILITY) {
                score += 18.0;
                reasons.add("Disability assistance protocol required");
            } else if (p.getVulnerabilityCategory() == VulnerabilityCategory.PREGNANT) {
                score += 15.0;
                reasons.add("Maternal protection protocol: pregnancy safety prioritized");
            } else if (p.getVulnerabilityCategory() == VulnerabilityCategory.ELDERLY) {
                score += 12.0;
                reasons.add("Senior citizen vulnerability index (Age " + p.getAge() + " yrs)");
            }

            if (p.getAge() != null && p.getAge() >= 80) {
                score += 10.0;
                reasons.add("Advanced geriatric age (80+ yrs) increases physiological risk");
            }

            if (p.getCaregiver() == null) {
                score += 8.0;
                reasons.add("Living alone without registered primary caregiver");
            }

            // Cap at 100
            score = Math.min(100.0, Math.round(score * 10.0) / 10.0);
            item.setPriorityScore(score);

            if (score >= 80.0) {
                item.setPriorityLevel("CRITICAL_IMMEDIATE");
            } else if (score >= 50.0) {
                item.setPriorityLevel("HIGH_PRIORITY");
            } else {
                item.setPriorityLevel("URGENT_MONITOR");
            }

            item.setReasons(reasons);

            // Find closest shelter
            Shelter nearestShelter = null;
            double nearestShelterDist = Double.MAX_VALUE;
            for (Shelter s : shelters) {
                if (s.getLatitude() != null && s.getLongitude() != null && p.getLatitude() != null && p.getLongitude() != null) {
                    double dist = SpatialUtils.haversineDistanceKm(
                            p.getLatitude(), p.getLongitude(),
                            s.getLatitude().doubleValue(), s.getLongitude().doubleValue()
                    );
                    if (dist < nearestShelterDist) {
                        nearestShelterDist = dist;
                        nearestShelter = s;
                    }
                }
            }

            if (nearestShelter != null) {
                item.setNearbyShelterName(nearestShelter.getShelterName());
                item.setNearbyShelterDistanceKm(Math.round(nearestShelterDist * 10.0) / 10.0);
            }

            // Action recommendation
            String action;
            if (item.isHasActiveSos() || score >= 80.0) {
                action = "Deploy immediate field rescue team. Evacuate to " +
                        (nearestShelter != null ? nearestShelter.getShelterName() : "nearest designated emergency shelter");
            } else if (score >= 50.0) {
                action = "Conduct proactive welfare check & prepare transport assistance to shelter";
            } else {
                action = "Issue early safety SMS alert & confirm caregiver contact readiness";
            }
            item.setRecommendedAction(action);

            // Recommend appropriate response team
            ResponseTeam recommendedTeam = null;
            if (p.getVulnerabilityCategory() == VulnerabilityCategory.MEDICAL_ASSISTANCE || p.getMobilityStatus() == MobilityStatus.BEDRIDDEN) {
                recommendedTeam = allTeams.stream()
                        .filter(t -> "MEDICAL_CORPS".equalsIgnoreCase(t.getTeamType()) || "AVAILABLE".equalsIgnoreCase(t.getCurrentAvailability()))
                        .findFirst().orElse(null);
            }
            if (recommendedTeam == null && !availableTeams.isEmpty()) {
                recommendedTeam = availableTeams.get(0);
            } else if (recommendedTeam == null && !allTeams.isEmpty()) {
                recommendedTeam = allTeams.get(0);
            }

            if (recommendedTeam != null) {
                item.setRecommendedTeamId(recommendedTeam.getTeamId());
                item.setRecommendedTeamName(recommendedTeam.getTeamName());
            }

            items.add(item);
        }

        // Sort descending by priority score
        items.sort((a, b) -> Double.compare(b.getPriorityScore(), a.getPriorityScore()));

        // Assign ranks 1..N
        for (int i = 0; i < items.size(); i++) {
            items.get(i).setRank(i + 1);
        }

        response.setPlanItems(items);
        return response;
    }
}
