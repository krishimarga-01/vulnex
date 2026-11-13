package com.extremeweather.risk;

import com.extremeweather.dto.RiskAssessmentResponse;
import com.extremeweather.dto.RiskScoreRuleDto;
import com.extremeweather.entity.*;
import com.extremeweather.exception.ResourceNotFoundException;
import com.extremeweather.repository.RiskAssessmentRepository;
import com.extremeweather.repository.RiskScoringRuleRepository;
import com.extremeweather.repository.VulnerablePersonRepository;
import com.extremeweather.repository.WeatherAlertRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RiskAssessmentEngine {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RiskAssessmentEngine.class);

    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final RiskScoringRuleRepository ruleRepository;
    private final RiskAssessmentRepository assessmentRepository;
    private final WeatherAlertRepository weatherAlertRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.risk.scoring.high-risk-threshold:75.0}")
    private double highRiskThreshold;

    @Value("${app.risk.scoring.medium-risk-threshold:45.0}")
    private double mediumRiskThreshold;

    public RiskScoringResult calculateRisk(VulnerablePerson person, WeatherAlert activeWeatherAlert) {
        List<RiskScoringRule> rules = ruleRepository.findByIsActiveTrue();
        List<ScoreBreakdownItem> breakdown = new ArrayList<>();
        double totalScore = 0.0;

        // 1. Age Factor Evaluation
        if (person.getAge() != null) {
            if (person.getAge() >= 75) {
                double points = getWeight(rules, "AGE_ELDERLY_EXTREME", 20.0);
                totalScore += points;
                breakdown.add(new ScoreBreakdownItem("AGE_ELDERLY_EXTREME", "AGE", points,
                        "Advanced age (" + person.getAge() + " yrs) poses elevated vulnerability to physiological stress."));
            } else if (person.getAge() >= 65) {
                double points = 10.0;
                totalScore += points;
                breakdown.add(new ScoreBreakdownItem("AGE_ELDERLY_MODERATE", "AGE", points,
                        "Senior citizen age (" + person.getAge() + " yrs) requires monitoring."));
            } else if (person.getAge() <= 5) {
                double points = getWeight(rules, "AGE_CHILD_INFANT", 15.0);
                totalScore += points;
                breakdown.add(new ScoreBreakdownItem("AGE_CHILD_INFANT", "AGE", points,
                        "Infant/toddler (< 5 yrs) requires specialized assistance during weather extremes."));
            }
        }

        // 2. Vulnerability Category Factor
        if (person.getVulnerabilityCategory() != null) {
            switch (person.getVulnerabilityCategory()) {
                case MEDICAL_ASSISTANCE -> {
                    double points = getWeight(rules, "VULN_MEDICAL", 25.0);
                    totalScore += points;
                    breakdown.add(new ScoreBreakdownItem("VULN_MEDICAL", "VULNERABILITY_TYPE", points,
                            "Dependent on electricity/medication support: " + (person.getMedicalConditions() != null ? person.getMedicalConditions() : "Chronic condition")));
                }
                case DISABILITY -> {
                    double points = getWeight(rules, "VULN_DISABILITY", 25.0);
                    totalScore += points;
                    breakdown.add(new ScoreBreakdownItem("VULN_DISABILITY", "VULNERABILITY_TYPE", points,
                            "Physical or sensory disability impacts autonomous evacuation capability."));
                }
                case PREGNANT -> {
                    double points = getWeight(rules, "VULN_PREGNANT", 20.0);
                    totalScore += points;
                    breakdown.add(new ScoreBreakdownItem("VULN_PREGNANT", "VULNERABILITY_TYPE", points,
                            "Pregnancy requires prioritized obstetric safety and safe shelter transfer."));
                }
                case ELDERLY -> {
                    double points = 10.0;
                    totalScore += points;
                    breakdown.add(new ScoreBreakdownItem("VULN_ELDERLY_CAT", "VULNERABILITY_TYPE", points,
                            "Registered under elderly vulnerable demographic index."));
                }
                default -> {}
            }
        }

        // 3. Mobility Factor Evaluation
        if (person.getMobilityStatus() != null) {
            if (person.getMobilityStatus() == MobilityStatus.BEDRIDDEN) {
                double points = getWeight(rules, "MOBILITY_BEDRIDDEN", 30.0);
                totalScore += points;
                breakdown.add(new ScoreBreakdownItem("MOBILITY_BEDRIDDEN", "MOBILITY", points,
                        "Bedridden status mandates stretcher/ambulance deployment for any evacuation."));
            } else if (person.getMobilityStatus() == MobilityStatus.WHEELCHAIR) {
                double points = getWeight(rules, "MOBILITY_WHEELCHAIR", 20.0);
                totalScore += points;
                breakdown.add(new ScoreBreakdownItem("MOBILITY_WHEELCHAIR", "MOBILITY", points,
                        "Wheelchair user requires accessible transport infrastructure."));
            } else if (person.getMobilityStatus() == MobilityStatus.ASSISTED) {
                double points = 10.0;
                totalScore += points;
                breakdown.add(new ScoreBreakdownItem("MOBILITY_ASSISTED", "MOBILITY", points,
                        "Assisted mobility requires personal escort."));
            }
        }

        // 4. Caregiver Support Factor
        if (person.getCaregiver() == null) {
            double points = getWeight(rules, "SUPPORT_NO_CAREGIVER", 15.0);
            totalScore += points;
            breakdown.add(new ScoreBreakdownItem("SUPPORT_NO_CAREGIVER", "SUPPORT_AVAILABILITY", points,
                    "No designated caregiver linked to profile increases unassisted isolation risk."));
        }

        // 5. Active Weather Hazard Context
        if (activeWeatherAlert != null && Boolean.TRUE.equals(activeWeatherAlert.getIsActive())) {
            double hazardScore = switch (activeWeatherAlert.getSeverity()) {
                case EXTREME -> 30.0;
                case SEVERE -> 20.0;
                case MODERATE -> 10.0;
                default -> 5.0;
            };
            totalScore += hazardScore;
            breakdown.add(new ScoreBreakdownItem("HAZARD_PROXIMITY", "WEATHER_HAZARD", hazardScore,
                    "In path of " + activeWeatherAlert.getSeverity() + " alert: " + activeWeatherAlert.getHeadline()));
        }

        // Cap at 100
        totalScore = Math.min(100.0, Math.round(totalScore * 10.0) / 10.0);

        RiskLevel level;
        if (totalScore >= highRiskThreshold) {
            level = RiskLevel.HIGH;
        } else if (totalScore >= mediumRiskThreshold) {
            level = RiskLevel.MEDIUM;
        } else {
            level = RiskLevel.LOW;
        }

        return new RiskScoringResult(totalScore, level, breakdown);
    }

    private double getWeight(List<RiskScoringRule> rules, String ruleCode, double defaultWeight) {
        return rules.stream()
                .filter(r -> r.getRuleCode().equalsIgnoreCase(ruleCode))
                .findFirst()
                .map(RiskScoringRule::getScoreWeight)
                .orElse(defaultWeight);
    }

    @Transactional
    public RiskAssessmentResponse assessPerson(UUID vulnerablePersonId, WeatherAlert alert, String assessedBy) {
        VulnerablePerson person = vulnerablePersonRepository.findById(vulnerablePersonId)
                .orElseThrow(() -> new ResourceNotFoundException("Vulnerable person not found with id: " + vulnerablePersonId));

        RiskScoringResult result = calculateRisk(person, alert);

        String breakdownJson;
        try {
            breakdownJson = objectMapper.writeValueAsString(result.getBreakdown());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize breakdown json", e);
            breakdownJson = "[]";
        }

        RiskScoringRule rule = ruleRepository.findByIsActiveTrue().stream().findFirst()
                .orElseGet(() -> ruleRepository.findAll().stream().findFirst().orElse(null));
        if (rule == null) {
            rule = ruleRepository.save(new RiskScoringRule(
                    null,
                    "v1.0-default",
                    "Baseline Vulnerability Rule",
                    "{}",
                    true,
                    null
            ));
        }

        RiskAssessment assessment = RiskAssessment.builder()
                .vulnerablePerson(person)
                .weatherAlert(alert)
                .scoringRule(rule)
                .calculatedScore(result.getTotalScore())
                .riskLevel(result.getRiskLevel())
                .breakdownJson(breakdownJson)
                .assessedAt(Instant.now())
                .assessedBy(assessedBy != null ? assessedBy : "SYSTEM")
                .build();
        assessment.setScoringRule(rule);

        assessment = assessmentRepository.save(assessment);

        person.setCurrentRiskScore(result.getTotalScore());
        person.setCurrentRiskLevel(result.getRiskLevel());
        vulnerablePersonRepository.save(person);

        List<RiskAssessmentResponse.ScoreBreakdownDto> breakdownDtos = result.getBreakdown().stream()
                .map(item -> new RiskAssessmentResponse.ScoreBreakdownDto(
                        item.getRuleCode(), item.getCategory(), item.getPointsAdded(), item.getExplanation()))
                .collect(Collectors.toList());

        return RiskAssessmentResponse.builder()
                .assessmentId(assessment.getId())
                .vulnerablePersonId(person.getId())
                .personName(person.getFullName())
                .calculatedScore(result.getTotalScore())
                .riskLevel(result.getRiskLevel())
                .breakdown(breakdownDtos)
                .assessedAt(assessment.getAssessedAt())
                .assessedBy(assessment.getAssessedBy())
                .build();
    }

    @Transactional
    public int reassessPersonsAffectedByAlert(WeatherAlert alert) {
        List<VulnerablePerson> persons = vulnerablePersonRepository.findAll();
        int count = 0;
        for (VulnerablePerson p : persons) {
            assessPerson(p.getId(), alert, "WEATHER_ALERT_TRIGGER");
            count++;
        }
        log.info("Completed automatic risk reassessment for {} persons following alert: {}", count, alert.getAlertCode());
        return count;
    }

    @Transactional(readOnly = true)
    public List<RiskScoringRule> getAllRules() {
        return ruleRepository.findAll();
    }

    @Transactional
    public RiskScoringRule createOrUpdateRule(RiskScoreRuleDto dto) {
        RiskScoringRule rule = ruleRepository.findByRuleCode(dto.getRuleCode())
                .orElse(new RiskScoringRule());

        rule.setRuleCode(dto.getRuleCode());
        rule.setCategory(dto.getCategory());
        rule.setDescription(dto.getDescription());
        rule.setConditionField(dto.getConditionField());
        rule.setOperator(dto.getOperator());
        rule.setThresholdValue(dto.getThresholdValue());
        rule.setScoreWeight(dto.getScoreWeight());
        rule.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return ruleRepository.save(rule);
    }

    public RiskAssessmentEngine(VulnerablePersonRepository vulnerablePersonRepository,
                                RiskScoringRuleRepository ruleRepository,
                                RiskAssessmentRepository assessmentRepository,
                                WeatherAlertRepository weatherAlertRepository,
                                ObjectMapper objectMapper) {
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.ruleRepository = ruleRepository;
        this.assessmentRepository = assessmentRepository;
        this.weatherAlertRepository = weatherAlertRepository;
        this.objectMapper = objectMapper;
    }
}
