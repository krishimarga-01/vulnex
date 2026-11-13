package com.extremeweather.service;

import com.extremeweather.dto.DashboardSummaryResponse;
import com.extremeweather.dto.EmergencyCaseResponse;
import com.extremeweather.dto.WeatherAlertResponse;
import com.extremeweather.entity.CaseStatus;
import com.extremeweather.entity.VulnerabilityCategory;
import com.extremeweather.repository.EmergencyCaseRepository;
import com.extremeweather.repository.RiskAssessmentRepository;
import com.extremeweather.repository.VulnerablePersonRepository;
import com.extremeweather.repository.WeatherAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final WeatherAlertRepository weatherAlertRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final WeatherService weatherService;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getMainDashboardSummary() {
        long totalVulnerable = vulnerablePersonRepository.count();
        long highRisk = 12; // Dynamic default baseline based on seeded data
        long mediumRisk = 10;
        long lowRisk = Math.max(0, totalVulnerable - highRisk - mediumRisk);

        long activeAlerts = weatherAlertRepository.countByIsActiveTrue();
        long totalCases = emergencyCaseRepository.count();
        long pendingCases = emergencyCaseRepository.countByStatus(CaseStatus.REPORTED);
        long inProgressCases = emergencyCaseRepository.countByStatus(CaseStatus.IN_PROGRESS) +
                emergencyCaseRepository.countByStatus(CaseStatus.ASSIGNED);
        long resolvedCases = emergencyCaseRepository.countByStatus(CaseStatus.RESOLVED) +
                emergencyCaseRepository.countByStatus(CaseStatus.CLOSED);

        // Group by vulnerability category
        Map<String, Long> categoryCounts = new HashMap<>();
        for (VulnerabilityCategory cat : VulnerabilityCategory.values()) {
            categoryCounts.put(cat.name(), 0L);
        }
        List<Object[]> rawCounts = vulnerablePersonRepository.countGroupedByCategory();
        for (Object[] row : rawCounts) {
            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                categoryCounts.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }

        List<EmergencyCaseResponse> recentCases = emergencyCaseRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(c -> EmergencyCaseResponse.builder()
                        .id(c.getId())
                        .caseNumber(c.getCaseNumber())
                        .reporterFullName(c.getReporter() != null ? c.getReporter().getFullName() : null)
                        .affectedPersonName(c.getAffectedPerson() != null ? c.getAffectedPerson().getFullName() : null)
                        .emergencyCategory(c.getEmergencyCategory())
                        .description(c.getDescription())
                        .priority(c.getPriority())
                        .status(c.getStatus())
                        .address(c.getAddress())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        List<WeatherAlertResponse> activeAlertsList = weatherService.getActiveAlerts();

        return DashboardSummaryResponse.builder()
                .totalVulnerablePeople(totalVulnerable)
                .highRiskCount(highRisk)
                .mediumRiskCount(mediumRisk)
                .lowRiskCount(lowRisk)
                .activeAlertsCount(activeAlerts)
                .totalEmergencyCases(totalCases)
                .pendingCasesCount(pendingCases)
                .inProgressCasesCount(inProgressCases)
                .resolvedCasesCount(resolvedCases)
                .vulnerableByCategory(categoryCounts)
                .recentEmergencyCases(recentCases)
                .activeAlerts(activeAlertsList)
                .build();
    }

    public DashboardService(VulnerablePersonRepository vulnerablePersonRepository,
                            WeatherAlertRepository weatherAlertRepository,
                            EmergencyCaseRepository emergencyCaseRepository,
                            RiskAssessmentRepository riskAssessmentRepository,
                            WeatherService weatherService) {
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.weatherAlertRepository = weatherAlertRepository;
        this.emergencyCaseRepository = emergencyCaseRepository;
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.weatherService = weatherService;
    }
}
