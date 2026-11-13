package com.extremeweather.risk;

import com.extremeweather.entity.*;
import com.extremeweather.repository.RiskAssessmentRepository;
import com.extremeweather.repository.RiskScoringRuleRepository;
import com.extremeweather.repository.VulnerablePersonRepository;
import com.extremeweather.repository.WeatherAlertRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RiskAssessmentEngineTest {

    @Mock
    private VulnerablePersonRepository vulnerablePersonRepository;

    @Mock
    private RiskScoringRuleRepository ruleRepository;

    @Mock
    private RiskAssessmentRepository assessmentRepository;

    @Mock
    private WeatherAlertRepository weatherAlertRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private RiskAssessmentEngine riskAssessmentEngine;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(riskAssessmentEngine, "highRiskThreshold", 75.0);
        ReflectionTestUtils.setField(riskAssessmentEngine, "mediumRiskThreshold", 45.0);
        ReflectionTestUtils.setField(riskAssessmentEngine, "objectMapper", objectMapper);
    }

    @Test
    @DisplayName("Should classify elderly bedridden individual during extreme heatwave as HIGH RISK")
    void testElderlyBedriddenHighRisk() {
        when(ruleRepository.findByIsActiveTrue()).thenReturn(Collections.emptyList());

        VulnerablePerson person = VulnerablePerson.builder()
                .id(UUID.randomUUID())
                .fullName("Eleanor Vance")
                .age(82)
                .vulnerabilityCategory(VulnerabilityCategory.ELDERLY)
                .mobilityStatus(MobilityStatus.BEDRIDDEN)
                .caregiver(null) // Lives alone -> adds support points
                .build();

        WeatherAlert alert = WeatherAlert.builder()
                .alertCode("ALT-TEST-001")
                .alertType(AlertType.HEATWAVE)
                .severity(SeverityLevel.EXTREME)
                .headline("Extreme Heatwave 44C")
                .isActive(true)
                .build();

        RiskScoringResult result = riskAssessmentEngine.calculateRisk(person, alert);

        assertNotNull(result);
        assertEquals(RiskLevel.HIGH, result.getRiskLevel());
        assertTrue(result.getTotalScore() >= 75.0, "Total score should be >= 75 for extreme profile");
        assertFalse(result.getBreakdown().isEmpty(), "Breakdown should have transparent explainable items");
    }

    @Test
    @DisplayName("Should classify young independent adult with mild alert as LOW RISK")
    void testLowRiskProfile() {
        when(ruleRepository.findByIsActiveTrue()).thenReturn(Collections.emptyList());

        User caregiver = User.builder().id(UUID.randomUUID()).fullName("Support Person").build();

        VulnerablePerson person = VulnerablePerson.builder()
                .id(UUID.randomUUID())
                .fullName("Young Adult")
                .age(30)
                .vulnerabilityCategory(VulnerabilityCategory.CHILD) // 10 pts
                .mobilityStatus(MobilityStatus.INDEPENDENT)
                .caregiver(caregiver)
                .build();

        RiskScoringResult result = riskAssessmentEngine.calculateRisk(person, null);

        assertNotNull(result);
        assertEquals(RiskLevel.LOW, result.getRiskLevel());
        assertTrue(result.getTotalScore() < 45.0);
    }
}