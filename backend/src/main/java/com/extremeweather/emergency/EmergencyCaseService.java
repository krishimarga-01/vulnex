package com.extremeweather.emergency;

import com.extremeweather.dto.*;
import com.extremeweather.entity.*;
import com.extremeweather.exception.BadRequestException;
import com.extremeweather.exception.ResourceNotFoundException;
import com.extremeweather.geography.SpatialUtils;
import com.extremeweather.repository.*;
import com.extremeweather.security.SecurityUtils;
import com.extremeweather.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmergencyCaseService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(EmergencyCaseService.class);

    private final EmergencyCaseRepository emergencyCaseRepository;
    private final EmergencyCategoryRepository emergencyCategoryRepository;
    private final UserRepository userRepository;
    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final ResponseTeamRepository responseTeamRepository;
    private final CaseAssignmentRepository caseAssignmentRepository;
    private final AuditService auditService;

    @Transactional
    public EmergencyCaseResponse createEmergencyCase(EmergencyCaseRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Must be authenticated to submit an emergency assistance request");
        }

        User reporter = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter user not found with id: " + currentUserId));

        VulnerablePerson affectedPerson = null;
        if (request.getAffectedPersonId() != null) {
            affectedPerson = vulnerablePersonRepository.findById(request.getAffectedPersonId()).orElse(null);
        }
        if (affectedPerson == null) {
            // Pick first registered person by this user or any seeded person
            affectedPerson = vulnerablePersonRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No vulnerable person record found to associate with SOS"));
        }

        String caseNumber = "EC-" + Instant.now().getEpochSecond() + "-" +
                UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        EmergencyPriority priority = request.getPriority() != null ? request.getPriority() : EmergencyPriority.HIGH;
        if (affectedPerson != null &&
                (affectedPerson.getCurrentRiskLevel() == RiskLevel.HIGH ||
                 affectedPerson.getMobilityStatus() == MobilityStatus.BEDRIDDEN)) {
            priority = EmergencyPriority.CRITICAL;
        }

        String catCode = request.getEmergencyCategory() != null ? request.getEmergencyCategory().name() : "MEDICAL_ASSISTANCE";
        if ("RESCUE_ASSISTANCE".equalsIgnoreCase(catCode)) catCode = "RESCUE";

        final String finalCatCode = catCode;
        EmergencyCategoryEntity catEntity = emergencyCategoryRepository.findByCategoryCode(finalCatCode)
                .orElseGet(() -> emergencyCategoryRepository.findAll().stream().findFirst().orElse(null));

        EmergencyCase emergencyCase = EmergencyCase.builder()
                .caseNumber(caseNumber)
                .reporter(reporter)
                .affectedPerson(affectedPerson)
                .emergencyCategory(request.getEmergencyCategory())
                .description(request.getDescription())
                .priority(priority)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .status(CaseStatus.REPORTED)
                .createdAt(Instant.now())
                .build();

        emergencyCase.setCategory(catEntity);
        emergencyCase = emergencyCaseRepository.save(emergencyCase);

        auditService.logAction("CREATE_EMERGENCY_CASE", "EmergencyCase", emergencyCase.getId().toString(),
                "Created emergency case: " + caseNumber + " [" + priority + "]", null);

        log.info("Emergency assistance request created: {} by user {}", caseNumber, reporter.getUsername());
        return mapToResponse(emergencyCase);
    }

    @Transactional(readOnly = true)
    public EmergencyCaseResponse getCaseById(UUID id) {
        EmergencyCase emergencyCase = emergencyCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency case not found with id: " + id));
        return mapToResponse(emergencyCase);
    }

    @Transactional(readOnly = true)
    public List<EmergencyCaseResponse> getMyReportedCases() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("User not authenticated");
        }
        return emergencyCaseRepository.findByReporterIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<EmergencyCaseResponse> searchCases(CaseStatus status, EmergencyPriority priority, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String term = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        return emergencyCaseRepository.searchCases(status, priority, term, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<EmergencyCaseResponse> getPendingCases() {
        return emergencyCaseRepository.findByStatus(CaseStatus.REPORTED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmergencyCaseResponse> getHighPriorityCases() {
        return emergencyCaseRepository.findByPriority(EmergencyPriority.CRITICAL).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmergencyCaseResponse> getCasesInRadius(double lat, double lon, double radiusKm) {
        return emergencyCaseRepository.findAll().stream()
                .filter(c -> SpatialUtils.isWithinRadius(c.getLatitude(), c.getLongitude(), lat, lon, radiusKm))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmergencyCaseResponse assignResponseTeam(UUID caseId, EmergencyCaseAssignmentRequest request) {
        EmergencyCase emergencyCase = emergencyCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency case not found with id: " + caseId));

        ResponseTeam team = responseTeamRepository.findById(request.getResponseTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Response team not found with id: " + request.getResponseTeamId()));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User assignedBy = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;

        emergencyCase.setAssignedTeam(team);
        emergencyCase.setStatus(CaseStatus.ASSIGNED);
        emergencyCase = emergencyCaseRepository.save(emergencyCase);

        CaseAssignment assignment = CaseAssignment.builder()
                .emergencyCase(emergencyCase)
                .responseTeam(team)
                .assignedBy(assignedBy)
                .assignedAt(Instant.now())
                .notes(request.getNotes())
                .status("ACTIVE")
                .build();
        caseAssignmentRepository.save(assignment);

        auditService.logAction("ASSIGN_RESPONSE_TEAM", "EmergencyCase", caseId.toString(),
                "Assigned response team: " + team.getTeamName() + " to case " + emergencyCase.getCaseNumber(), null);

        log.info("Emergency case {} assigned to team {}", emergencyCase.getCaseNumber(), team.getTeamName());
        return mapToResponse(emergencyCase);
    }

    @Transactional
    public EmergencyCaseResponse updateCaseStatus(UUID caseId, EmergencyCaseStatusUpdateRequest request) {
        EmergencyCase emergencyCase = emergencyCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency case not found with id: " + caseId));

        emergencyCase.setStatus(request.getStatus());
        if (request.getResolutionDetails() != null) {
            emergencyCase.setResolutionDetails(request.getResolutionDetails());
        }

        if (request.getStatus() == CaseStatus.RESOLVED || request.getStatus() == CaseStatus.CLOSED) {
            emergencyCase.setResolvedAt(Instant.now());
        }

        emergencyCase = emergencyCaseRepository.save(emergencyCase);

        auditService.logAction("UPDATE_CASE_STATUS", "EmergencyCase", caseId.toString(),
                "Case " + emergencyCase.getCaseNumber() + " status updated to " + request.getStatus(), null);

        return mapToResponse(emergencyCase);
    }

    @Transactional(readOnly = true)
    public List<ResponseTeam> getAvailableResponseTeams() {
        return responseTeamRepository.findByIsAvailableTrue();
    }

    private EmergencyCaseResponse mapToResponse(EmergencyCase c) {
        return EmergencyCaseResponse.builder()
                .id(c.getId())
                .caseNumber(c.getCaseNumber())
                .reporterUserId(c.getReporter() != null ? c.getReporter().getId() : null)
                .reporterFullName(c.getReporter() != null ? c.getReporter().getFullName() : null)
                .reporterPhone(c.getReporter() != null ? c.getReporter().getPhoneNumber() : null)
                .affectedPersonId(c.getAffectedPerson() != null ? c.getAffectedPerson().getId() : null)
                .affectedPersonName(c.getAffectedPerson() != null ? c.getAffectedPerson().getFullName() : null)
                .emergencyCategory(c.getEmergencyCategory())
                .description(c.getDescription())
                .priority(c.getPriority())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .address(c.getAddress())
                .status(c.getStatus())
                .resolutionDetails(c.getResolutionDetails())
                .assignedTeamId(c.getAssignedTeam() != null ? c.getAssignedTeam().getId() : null)
                .assignedTeamName(c.getAssignedTeam() != null ? c.getAssignedTeam().getTeamName() : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .resolvedAt(c.getResolvedAt())
                .build();
    }

    public EmergencyCaseService(EmergencyCaseRepository emergencyCaseRepository,
                                EmergencyCategoryRepository emergencyCategoryRepository,
                                UserRepository userRepository,
                                VulnerablePersonRepository vulnerablePersonRepository,
                                ResponseTeamRepository responseTeamRepository,
                                CaseAssignmentRepository caseAssignmentRepository,
                                AuditService auditService) {
        this.emergencyCaseRepository = emergencyCaseRepository;
        this.emergencyCategoryRepository = emergencyCategoryRepository;
        this.userRepository = userRepository;
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.responseTeamRepository = responseTeamRepository;
        this.caseAssignmentRepository = caseAssignmentRepository;
        this.auditService = auditService;
    }
}
