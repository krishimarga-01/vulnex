package com.extremeweather.service;

import com.extremeweather.dto.VulnerablePersonRequest;
import com.extremeweather.dto.VulnerablePersonResponse;
import com.extremeweather.entity.MobilityStatus;
import com.extremeweather.entity.RiskLevel;
import com.extremeweather.entity.VerificationStatus;
import com.extremeweather.entity.VulnerabilityCategory;
import com.extremeweather.entity.VulnerablePerson;
import com.extremeweather.repository.CaregiverRelationshipRepository;
import com.extremeweather.repository.UserRepository;
import com.extremeweather.repository.VulnerablePersonRepository;
import com.extremeweather.risk.RiskAssessmentEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VulnerablePersonServiceTest {

    @Mock
    private VulnerablePersonRepository vulnerablePersonRepository;

    @Mock
    private com.extremeweather.repository.VulnerabilityCategoryRepository vulnerabilityCategoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CaregiverRelationshipRepository caregiverRelationshipRepository;

    @Mock
    private RiskAssessmentEngine riskAssessmentEngine;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private VulnerablePersonService vulnerablePersonService;

    @Test
    @DisplayName("Should successfully register vulnerable person with risk assessment")
    void testRegisterVulnerablePerson() {
        UUID personId = UUID.randomUUID();

        VulnerablePersonRequest request = VulnerablePersonRequest.builder()
                .nationalId("NAT-TEST-1")
                .fullName("Jane Doe")
                .age(80)
                .vulnerabilityCategory(VulnerabilityCategory.ELDERLY)
                .mobilityStatus(MobilityStatus.WHEELCHAIR)
                .latitude(13.08)
                .longitude(80.27)
                .contactNumber("+1-555-1234")
                .address("10 Main St")
                .consentGiven(true)
                .build();

        VulnerablePerson saved = VulnerablePerson.builder()
                .id(personId)
                .nationalId("NAT-TEST-1")
                .fullName("Jane Doe")
                .age(80)
                .vulnerabilityCategory(VulnerabilityCategory.ELDERLY)
                .mobilityStatus(MobilityStatus.WHEELCHAIR)
                .latitude(13.08)
                .longitude(80.27)
                .verificationStatus(VerificationStatus.VERIFIED)
                .currentRiskLevel(RiskLevel.MEDIUM)
                .currentRiskScore(60.0)
                .consentGiven(true)
                .build();

        when(vulnerablePersonRepository.findByNationalId("NAT-TEST-1")).thenReturn(Optional.empty());
        when(vulnerabilityCategoryRepository.findByCategoryCode(anyString())).thenReturn(Optional.of(
                new com.extremeweather.entity.VulnerabilityCategoryEntity(UUID.randomUUID(), "ELDERLY", "Elderly", 1)));
        when(vulnerablePersonRepository.save(any(VulnerablePerson.class))).thenReturn(saved);
        when(vulnerablePersonRepository.findById(personId)).thenReturn(Optional.of(saved));

        VulnerablePersonResponse response = vulnerablePersonService.registerVulnerablePerson(request);

        assertNotNull(response);
        assertEquals("Jane Doe", response.getFullName());
        assertEquals(80, response.getAge());
        verify(riskAssessmentEngine, times(1)).assessPerson(eq(personId), isNull(), eq("INITIAL_REGISTRATION"));
    }

    @Test
    @DisplayName("Should retrieve immediate assistance candidates")
    void testGetPeopleRequiringImmediateAssistance() {
        VulnerablePerson p1 = VulnerablePerson.builder()
                .id(UUID.randomUUID())
                .fullName("Critical Person")
                .currentRiskLevel(RiskLevel.HIGH)
                .vulnerabilityCategory(VulnerabilityCategory.MEDICAL_ASSISTANCE)
                .mobilityStatus(MobilityStatus.BEDRIDDEN)
                .build();

        when(vulnerablePersonRepository.findAll()).thenReturn(List.of(p1));

        List<VulnerablePersonResponse> result = vulnerablePersonService.getPeopleRequiringImmediateAssistance();

        assertEquals(1, result.size());
        assertEquals("Critical Person", result.get(0).getFullName());
    }
}