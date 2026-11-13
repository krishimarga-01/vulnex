package com.extremeweather.emergency;

import com.extremeweather.dto.EmergencyCaseAssignmentRequest;
import com.extremeweather.dto.EmergencyCaseRequest;
import com.extremeweather.dto.EmergencyCaseResponse;
import com.extremeweather.dto.EmergencyCaseStatusUpdateRequest;
import com.extremeweather.entity.*;
import com.extremeweather.repository.*;
import com.extremeweather.security.UserPrincipal;
import com.extremeweather.service.AuditService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmergencyCaseServiceTest {

    @Mock
    private EmergencyCaseRepository emergencyCaseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VulnerablePersonRepository vulnerablePersonRepository;

    @Mock
    private ResponseTeamRepository responseTeamRepository;

    @Mock
    private CaseAssignmentRepository caseAssignmentRepository;

    @Mock
    private EmergencyCategoryRepository emergencyCategoryRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private EmergencyCaseService emergencyCaseService;

    @Test
    @DisplayName("Should create emergency case with auto-escalation to CRITICAL if victim is bedridden")
    void testCreateEmergencyCaseEscalation() {
        UUID userId = UUID.randomUUID();
        UUID victimId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();

        UserPrincipal principal = UserPrincipal.builder()
                .id(userId)
                .username("citizen_user")
                .role(RoleEnum.ROLE_CITIZEN)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));

        User user = User.builder().id(userId).username("citizen_user").build();
        VulnerablePerson victim = VulnerablePerson.builder()
                .id(victimId)
                .fullName("Grandmother")
                .mobilityStatus(MobilityStatus.BEDRIDDEN)
                .currentRiskLevel(RiskLevel.HIGH)
                .build();

        EmergencyCaseRequest request = EmergencyCaseRequest.builder()
                .affectedPersonId(victimId)
                .emergencyCategory(EmergencyCategory.MEDICAL_ASSISTANCE)
                .description("Oxygen concentrator power failure")
                .priority(EmergencyPriority.HIGH)
                .latitude(13.08)
                .longitude(80.27)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(vulnerablePersonRepository.findById(victimId)).thenReturn(Optional.of(victim));
        when(emergencyCategoryRepository.findByCategoryCode(anyString())).thenReturn(Optional.of(
                new EmergencyCategoryEntity(UUID.randomUUID(), "MEDICAL_ASSISTANCE", "Medical Assistance", 1)));
        when(emergencyCaseRepository.save(any(EmergencyCase.class))).thenAnswer(invocation -> {
            EmergencyCase c = invocation.getArgument(0);
            c.setId(caseId);
            return c;
        });

        EmergencyCaseResponse response = emergencyCaseService.createEmergencyCase(request);

        assertNotNull(response);
        assertEquals(EmergencyPriority.CRITICAL, response.getPriority(), "Should auto-escalate to CRITICAL for bedridden victim");
        assertEquals(CaseStatus.REPORTED, response.getStatus());
    }

    @Test
    @DisplayName("Should assign response team and transition status to ASSIGNED")
    void testAssignResponseTeam() {
        UUID caseId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        EmergencyCase emergencyCase = EmergencyCase.builder()
                .id(caseId)
                .caseNumber("EC-2026-TEST")
                .status(CaseStatus.REPORTED)
                .build();

        ResponseTeam team = ResponseTeam.builder()
                .id(teamId)
                .teamName("Mobile Critical Care Unit Alpha")
                .build();

        when(emergencyCaseRepository.findById(caseId)).thenReturn(Optional.of(emergencyCase));
        when(responseTeamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(emergencyCaseRepository.save(any(EmergencyCase.class))).thenAnswer(i -> i.getArgument(0));

        EmergencyCaseAssignmentRequest req = EmergencyCaseAssignmentRequest.builder()
                .responseTeamId(teamId)
                .notes("Deploying oxygen cylinders")
                .build();

        EmergencyCaseResponse resp = emergencyCaseService.assignResponseTeam(caseId, req);

        assertEquals(CaseStatus.ASSIGNED, resp.getStatus());
        assertEquals("Mobile Critical Care Unit Alpha", resp.getAssignedTeamName());
        verify(caseAssignmentRepository, times(1)).save(any(CaseAssignment.class));
    }

    @Test
    @DisplayName("Should resolve emergency case with resolution notes")
    void testResolveCase() {
        UUID caseId = UUID.randomUUID();

        EmergencyCase emergencyCase = EmergencyCase.builder()
                .id(caseId)
                .caseNumber("EC-2026-TEST")
                .status(CaseStatus.ASSIGNED)
                .build();

        when(emergencyCaseRepository.findById(caseId)).thenReturn(Optional.of(emergencyCase));
        when(emergencyCaseRepository.save(any(EmergencyCase.class))).thenAnswer(i -> i.getArgument(0));

        EmergencyCaseStatusUpdateRequest req = EmergencyCaseStatusUpdateRequest.builder()
                .status(CaseStatus.RESOLVED)
                .resolutionDetails("Patient evacuated to central clinic; oxygen stabilized.")
                .build();

        EmergencyCaseResponse resp = emergencyCaseService.updateCaseStatus(caseId, req);

        assertEquals(CaseStatus.RESOLVED, resp.getStatus());
        assertNotNull(resp.getResolvedAt());
        assertEquals("Patient evacuated to central clinic; oxygen stabilized.", resp.getResolutionDetails());
    }
}