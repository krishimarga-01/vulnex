package com.extremeweather.workflow;

import com.extremeweather.dto.*;
import com.extremeweather.emergency.EmergencyCaseService;
import com.extremeweather.entity.*;
import com.extremeweather.repository.*;
import com.extremeweather.security.JwtTokenProvider;
import com.extremeweather.security.SecurityUtils;
import com.extremeweather.service.UserService;
import com.extremeweather.service.VulnerablePersonService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("End-to-End Emergency Lifecycle Workflow Integration Test")
public class EndToEndEmergencyWorkflowIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private VulnerablePersonService vulnerablePersonService;

    @Autowired
    private EmergencyCaseService emergencyCaseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VulnerablePersonRepository vulnerablePersonRepository;

    @Autowired
    private EmergencyCaseRepository emergencyCaseRepository;

    @Autowired
    private ResponseTeamRepository responseTeamRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User citizenUser;
    private ResponseTeam rescueTeam;

    @BeforeEach
    void setUp() {
        // Create rescue team if none exists
        if (responseTeamRepository.count() == 0) {
            rescueTeam = responseTeamRepository.save(ResponseTeam.builder()
                    .teamName("Rapid Evacuation Unit Alpha")
                    .teamType("RESCUE")
                    .contactPhone("+91-9988776655")
                    .baseLocationName("Central Disaster Station")
                    .isAvailable(true)
                    .currentCapacity(8)
                    .build());
        } else {
            rescueTeam = responseTeamRepository.findAll().get(0);
        }

        // Register a citizen user
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setUsername("citizen_e2e_user");
        registerReq.setEmail("citizen_e2e_user@example.com");
        registerReq.setPassword("Password@123");
        registerReq.setFullName("Ravi Shankar Citizen");
        registerReq.setPhoneNumber("+91-9876543210");
        registerReq.setRole(RoleEnum.ROLE_CITIZEN);
        registerReq.setEmergencyContactName("Shankar (Father)");
        registerReq.setEmergencyContactPhone("+91-9876543211");

        AuthResponse authRes = userService.register(registerReq);
        assertNotNull(authRes.getToken());
        assertEquals("citizen_e2e_user@example.com", authRes.getUsername());

        citizenUser = userRepository.findById(authRes.getUserId()).orElseThrow();

        // Establish security context
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                citizenUser.getUsername(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_CITIZEN"))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Complete E2E: Citizen Register -> Vulnerable Person -> SOS -> Dispatch -> Resolve -> Audit Log")
    void testCompleteEmergencyWorkflow() {
        // Step 1: Citizen logs in and generates JWT
        AuthRequest loginReq = new AuthRequest("citizen_e2e_user@example.com", "Password@123");
        AuthResponse loginRes = userService.login(loginReq);
        assertNotNull(loginRes.getToken());
        assertTrue(jwtTokenProvider.validateToken(loginRes.getToken()));

        // Step 2: Register a vulnerable elderly relative
        VulnerablePersonRequest personReq = new VulnerablePersonRequest();
        personReq.setFullName("Devamma Gowda");
        personReq.setAge(84);
        personReq.setGender("FEMALE");
        personReq.setVulnerabilityCategory(VulnerabilityCategory.ELDERLY);
        personReq.setMobilityStatus(MobilityStatus.BEDRIDDEN);
        personReq.setMedicalConditions("Severe respiratory distress, oxygen concentrator dependent");
        personReq.setAssistanceRequirements("Requires stretcher evacuation and battery backup");
        personReq.setContactNumber("+91-9876543299");
        personReq.setAddress("14 Temple Road, Ward 5, Kodagu");
        personReq.setEmergencyContactName("Ravi Shankar");
        personReq.setEmergencyContactPhone("+91-9876543210");
        personReq.setEmergencyContactRelationship("Son");
        personReq.setLatitude(12.4244);
        personReq.setLongitude(75.7382);
        personReq.setConsentGiven(true);

        VulnerablePersonResponse personRes = vulnerablePersonService.registerVulnerablePerson(personReq);
        assertNotNull(personRes.getId());
        assertEquals("Devamma Gowda", personRes.getFullName());
        assertEquals("HIGH", personRes.getCurrentRiskLevel().name()); // Bedridden 84yo should auto-score HIGH

        // Step 3: Verify vulnerable individual is persisted in database
        VulnerablePerson persistedPerson = vulnerablePersonRepository.findById(personRes.getId()).orElseThrow();
        assertEquals(84, persistedPerson.getAge());
        assertEquals(MobilityStatus.BEDRIDDEN, persistedPerson.getMobilityStatus());
        assertEquals(citizenUser.getId(), persistedPerson.getRegisteredBy().getId());

        // Step 4: Submit SOS distress call from citizen mobile app for this vulnerable person
        EmergencyCaseRequest sosReq = new EmergencyCaseRequest();
        sosReq.setAffectedPersonId(persistedPerson.getId());
        sosReq.setEmergencyCategory(EmergencyCategory.MEDICAL_ASSISTANCE);
        sosReq.setDescription("Power failure in sector! Oxygen concentrator running out of battery backup!");
        sosReq.setPriority(EmergencyPriority.CRITICAL);
        sosReq.setLatitude(12.4244);
        sosReq.setLongitude(75.7382);
        sosReq.setAddress("14 Temple Road, Ward 5, Kodagu");

        EmergencyCaseResponse caseRes = emergencyCaseService.createEmergencyCase(sosReq);
        assertNotNull(caseRes.getId());
        assertNotNull(caseRes.getCaseNumber());
        assertEquals(CaseStatus.REPORTED, caseRes.getStatus());
        assertEquals(EmergencyPriority.CRITICAL, caseRes.getPriority());

        // Step 5: Verify emergency case is in database
        EmergencyCase persistedCase = emergencyCaseRepository.findById(caseRes.getId()).orElseThrow();
        assertEquals(citizenUser.getId(), persistedCase.getReporter().getId());
        assertEquals(persistedPerson.getId(), persistedCase.getAffectedPerson().getId());

        // Step 6: Dispatch / Assign Response Team
        EmergencyCaseAssignmentRequest assignReq = new EmergencyCaseAssignmentRequest();
        assignReq.setResponseTeamId(rescueTeam.getId());
        assignReq.setNotes("High priority: Oxygen concentrator dispatch needed with backup inverter");

        EmergencyCaseResponse assignedCase = emergencyCaseService.assignResponseTeam(persistedCase.getId(), assignReq);
        assertEquals(CaseStatus.ASSIGNED, assignedCase.getStatus());
        assertEquals(rescueTeam.getTeamName(), assignedCase.getAssignedTeamName());

        // Step 7: Update Emergency Status to IN_PROGRESS then RESOLVED
        EmergencyCaseStatusUpdateRequest inProgressReq = new EmergencyCaseStatusUpdateRequest();
        inProgressReq.setStatus(CaseStatus.IN_PROGRESS);
        inProgressReq.setResolutionDetails("Rescue unit en route, ETA 8 minutes");

        EmergencyCaseResponse inProgressCase = emergencyCaseService.updateCaseStatus(persistedCase.getId(), inProgressReq);
        assertEquals(CaseStatus.IN_PROGRESS, inProgressCase.getStatus());

        EmergencyCaseStatusUpdateRequest resolvedReq = new EmergencyCaseStatusUpdateRequest();
        resolvedReq.setStatus(CaseStatus.RESOLVED);
        resolvedReq.setResolutionDetails("Patient successfully evacuated to Madikeri Junior College Shelter. Auxiliary oxygen connected.");

        EmergencyCaseResponse resolvedCase = emergencyCaseService.updateCaseStatus(persistedCase.getId(), resolvedReq);
        assertEquals(CaseStatus.RESOLVED, resolvedCase.getStatus());
        assertNotNull(resolvedCase.getResolutionDetails());

        // Step 8: Verify full audit log trail was persisted in PostgreSQL
        List<AuditLog> auditLogs = auditLogRepository.findTop20ByOrderByCreatedAtDesc();
        assertFalse(auditLogs.isEmpty(), "Audit logs should record emergency case activities");
    }
}
