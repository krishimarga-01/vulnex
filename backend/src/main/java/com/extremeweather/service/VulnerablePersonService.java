package com.extremeweather.service;

import com.extremeweather.dto.VulnerablePersonRequest;
import com.extremeweather.dto.VulnerablePersonResponse;
import com.extremeweather.dto.VulnerablePersonSearchCriteria;
import com.extremeweather.entity.*;
import com.extremeweather.exception.BadRequestException;
import com.extremeweather.exception.ConflictException;
import com.extremeweather.exception.ResourceNotFoundException;
import com.extremeweather.geography.SpatialUtils;
import com.extremeweather.repository.CaregiverRelationshipRepository;
import com.extremeweather.repository.UserRepository;
import com.extremeweather.repository.VulnerabilityCategoryRepository;
import com.extremeweather.repository.VulnerablePersonRepository;
import com.extremeweather.risk.RiskAssessmentEngine;
import com.extremeweather.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VulnerablePersonService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(VulnerablePersonService.class);

    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final VulnerabilityCategoryRepository vulnerabilityCategoryRepository;
    private final UserRepository userRepository;
    private final CaregiverRelationshipRepository caregiverRelationshipRepository;
    private final RiskAssessmentEngine riskAssessmentEngine;
    private final AuditService auditService;

    @Transactional
    public VulnerablePersonResponse registerVulnerablePerson(VulnerablePersonRequest request) {
        return register(request);
    }

    @Transactional
    public VulnerablePersonResponse register(VulnerablePersonRequest request) {
        String nationalId = request.getNationalId();
        if (nationalId != null && !nationalId.isBlank()) {
            if (vulnerablePersonRepository.findByNationalId(nationalId).isPresent()) {
                throw new ConflictException("A person is already registered with national ID: " + nationalId);
            }
        } else {
            nationalId = "VP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;

        User caregiver = null;
        if (request.getCaregiverUserId() != null) {
            caregiver = userRepository.findById(request.getCaregiverUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Caregiver user not found with id: " + request.getCaregiverUserId()));
        } else if (currentUser != null && currentUser.getRole() == RoleEnum.ROLE_CAREGIVER) {
            caregiver = currentUser;
        }

        String code = "ELDERLY";
        if (request.getVulnerabilityCategory() == VulnerabilityCategory.CHILD) code = "CHILD";
        else if (request.getVulnerabilityCategory() == VulnerabilityCategory.DISABILITY) code = "PERSON_WITH_DISABILITY";
        else if (request.getVulnerabilityCategory() == VulnerabilityCategory.PREGNANT) code = "PREGNANT_WOMAN";
        else if (request.getVulnerabilityCategory() == VulnerabilityCategory.MEDICAL_ASSISTANCE) code = "MEDICAL_ASSISTANCE_REQUIRED";

        VulnerabilityCategoryEntity catEntity = vulnerabilityCategoryRepository.findByCategoryCode(code)
                .orElseGet(() -> vulnerabilityCategoryRepository.findAll().stream().findFirst().orElse(null));

        VulnerablePerson person = VulnerablePerson.builder()
                .nationalId(nationalId)
                .fullName(request.getFullName())
                .age(request.getAge())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .vulnerabilityCategory(request.getVulnerabilityCategory())
                .medicalConditions(request.getMedicalConditions())
                .mobilityStatus(request.getMobilityStatus() != null ? request.getMobilityStatus() : MobilityStatus.INDEPENDENT)
                .assistanceRequirements(request.getAssistanceRequirements())
                .contactNumber(request.getContactNumber())
                .address(request.getAddress())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .emergencyContactRelationship(request.getEmergencyContactRelationship())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .registeredBy(currentUser)
                .caregiver(caregiver)
                .verificationStatus(VerificationStatus.VERIFIED)
                .consentGiven(request.getConsentGiven() != null ? request.getConsentGiven() : true)
                .currentRiskLevel(RiskLevel.LOW)
                .currentRiskScore(0.0)
                .build();

        person.setPrimaryCategory(catEntity);
        person = vulnerablePersonRepository.save(person);

        // If caregiver linked, establish relationship
        if (caregiver != null) {
            CaregiverRelationship rel = CaregiverRelationship.builder()
                    .caregiver(caregiver)
                    .vulnerablePerson(person)
                    .relationshipType(request.getEmergencyContactRelationship() != null ?
                            request.getEmergencyContactRelationship() : "GUARDIAN")
                    .isPrimary(true)
                    .verified(true)
                    .build();
            caregiverRelationshipRepository.save(rel);
        }

        // Run initial transparent risk assessment
        com.extremeweather.dto.RiskAssessmentResponse riskRes = riskAssessmentEngine.assessPerson(person.getId(), null, "INITIAL_REGISTRATION");

        auditService.logAction("REGISTER_VULNERABLE_PERSON", "VulnerablePerson", person.getId().toString(),
                "Registered vulnerable person: " + person.getFullName(), null);

        // Fetch refreshed entity
        person = vulnerablePersonRepository.findById(person.getId()).orElse(person);
        if (riskRes != null) {
            person.setCurrentRiskLevel(riskRes.getRiskLevel());
            person.setCurrentRiskScore(riskRes.getCalculatedScore());
        }
        return mapToResponse(person, true);
    }

    @Transactional
    public VulnerablePersonResponse updateProfile(UUID id, VulnerablePersonRequest request) {
        VulnerablePerson person = vulnerablePersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vulnerable person not found with id: " + id));

        person.setFullName(request.getFullName());
        person.setAge(request.getAge());
        person.setDateOfBirth(request.getDateOfBirth());
        person.setGender(request.getGender());
        person.setVulnerabilityCategory(request.getVulnerabilityCategory());
        person.setMedicalConditions(request.getMedicalConditions());
        if (request.getMobilityStatus() != null) {
            person.setMobilityStatus(request.getMobilityStatus());
        }
        person.setAssistanceRequirements(request.getAssistanceRequirements());
        person.setContactNumber(request.getContactNumber());
        person.setAddress(request.getAddress());
        person.setEmergencyContactName(request.getEmergencyContactName());
        person.setEmergencyContactPhone(request.getEmergencyContactPhone());
        person.setEmergencyContactRelationship(request.getEmergencyContactRelationship());
        person.setLatitude(request.getLatitude());
        person.setLongitude(request.getLongitude());

        person = vulnerablePersonRepository.save(person);

        // Re-calculate risk score
        riskAssessmentEngine.assessPerson(person.getId(), null, "PROFILE_UPDATE");

        auditService.logAction("UPDATE_VULNERABLE_PERSON", "VulnerablePerson", person.getId().toString(),
                "Updated details for: " + person.getFullName(), null);

        person = vulnerablePersonRepository.findById(person.getId()).orElse(person);
        return mapToResponse(person, true);
    }

    @Transactional(readOnly = true)
    public VulnerablePersonResponse getPersonById(UUID id) {
        VulnerablePerson person = vulnerablePersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vulnerable person not found with id: " + id));

        boolean canAccessPii = canAccessSensitiveInformation(person);
        auditService.logAction("VIEW_VULNERABLE_PERSON", "VulnerablePerson", person.getId().toString(),
                "Viewed person profile (PII allowed: " + canAccessPii + ")", null);

        return mapToResponse(person, canAccessPii);
    }

    @Transactional(readOnly = true)
    public Page<VulnerablePersonResponse> searchPersons(VulnerablePersonSearchCriteria criteria) {
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), Sort.by("createdAt").descending());

        Page<VulnerablePerson> page;
        String term = criteria.getSearchTerm();
        if (term != null && !term.trim().isEmpty()) {
            page = vulnerablePersonRepository.searchPersons(
                    criteria.getCategory(),
                    criteria.getRiskLevel(),
                    criteria.getVerificationStatus(),
                    term.trim().toLowerCase(),
                    pageable);
        } else if (criteria.getCategory() != null) {
            page = vulnerablePersonRepository.findByCategoryCode(criteria.getCategory().name(), pageable);
        } else {
            page = vulnerablePersonRepository.findAll(pageable);
        }

        boolean isAuthority = SecurityUtils.isAuthorityOrAdmin();

        return page.map(p -> mapToResponse(p, isAuthority || canAccessSensitiveInformation(p)));
    }

    @Transactional(readOnly = true)
    public List<VulnerablePersonResponse> getPeopleInAffectedRegion(double centerLat, double centerLon, double radiusKm) {
        List<VulnerablePerson> persons = vulnerablePersonRepository.findAll().stream()
                .filter(p -> SpatialUtils.isWithinRadius(p.getLatitude(), p.getLongitude(), centerLat, centerLon, radiusKm))
                .collect(Collectors.toList());

        boolean isAuthority = SecurityUtils.isAuthorityOrAdmin();
        return persons.stream()
                .map(p -> mapToResponse(p, isAuthority))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VulnerablePersonResponse> getPeopleRequiringImmediateAssistance() {
        List<VulnerablePerson> persons = vulnerablePersonRepository.findAll().stream()
                .filter(p -> p.getCurrentRiskLevel() == RiskLevel.HIGH ||
                        p.getMobilityStatus() == MobilityStatus.BEDRIDDEN ||
                        p.getVulnerabilityCategory() == VulnerabilityCategory.MEDICAL_ASSISTANCE)
                .collect(Collectors.toList());

        boolean isAuthority = SecurityUtils.isAuthorityOrAdmin();
        return persons.stream()
                .map(p -> mapToResponse(p, isAuthority))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VulnerablePersonResponse> getMyVulnerablePersons() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("User not authenticated");
        }

        List<VulnerablePerson> persons = vulnerablePersonRepository.findByCaregiverOrRegisteredBy(currentUserId, currentUserId);
        return persons.stream()
                .map(p -> mapToResponse(p, true))
                .collect(Collectors.toList());
    }

    private boolean canAccessSensitiveInformation(VulnerablePerson person) {
        if (SecurityUtils.isAuthorityOrAdmin()) {
            return true;
        }
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) return false;

        boolean isRegistrant = person.getRegisteredBy() != null && person.getRegisteredBy().getId().equals(currentUserId);
        boolean isCaregiver = person.getCaregiver() != null && person.getCaregiver().getId().equals(currentUserId);

        return isRegistrant || isCaregiver;
    }

    private VulnerablePersonResponse mapToResponse(VulnerablePerson person, boolean showPii) {
        return VulnerablePersonResponse.builder()
                .id(person.getId())
                .nationalId(person.getNationalId())
                .fullName(person.getFullName())
                .age(person.getAge())
                .dateOfBirth(person.getDateOfBirth())
                .gender(person.getGender())
                .vulnerabilityCategory(person.getVulnerabilityCategory())
                .medicalConditions(person.getMedicalConditions())
                .mobilityStatus(person.getMobilityStatus())
                .assistanceRequirements(person.getAssistanceRequirements())
                .contactNumber(showPii ? person.getContactNumber() : maskSensitive(person.getContactNumber()))
                .address(showPii ? person.getAddress() : maskAddress(person.getAddress()))
                .emergencyContactName(showPii ? person.getEmergencyContactName() : "MASKED (CONSENT RESTRICTED)")
                .emergencyContactPhone(showPii ? person.getEmergencyContactPhone() : maskSensitive(person.getEmergencyContactPhone()))
                .emergencyContactRelationship(person.getEmergencyContactRelationship())
                .latitude(person.getLatitude())
                .longitude(person.getLongitude())
                .registeredByUserId(person.getRegisteredBy() != null ? person.getRegisteredBy().getId() : null)
                .registeredByUsername(person.getRegisteredBy() != null ? person.getRegisteredBy().getUsername() : null)
                .caregiverUserId(person.getCaregiver() != null ? person.getCaregiver().getId() : null)
                .caregiverName(person.getCaregiver() != null ? person.getCaregiver().getFullName() : null)
                .verificationStatus(person.getVerificationStatusEnum())
                .consentGiven(person.getConsentGiven())
                .currentRiskLevel(person.getCurrentRiskLevel())
                .currentRiskScore(person.getCurrentRiskScore())
                .createdAt(person.getCreatedAt())
                .updatedAt(person.getUpdatedAt())
                .build();
    }

    private String maskSensitive(String val) {
        if (val == null || val.length() < 4) return "****";
        return val.substring(0, 2) + "****" + val.substring(val.length() - 2);
    }

    private String maskAddress(String val) {
        if (val == null || val.isBlank()) return "Protected Area";
        return "[Area Protected - Geo coordinates available for authorized dispatch]";
    }

    public VulnerablePersonService(VulnerablePersonRepository vulnerablePersonRepository,
                                  VulnerabilityCategoryRepository vulnerabilityCategoryRepository,
                                  UserRepository userRepository,
                                  CaregiverRelationshipRepository caregiverRelationshipRepository,
                                  RiskAssessmentEngine riskAssessmentEngine,
                                  AuditService auditService) {
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.vulnerabilityCategoryRepository = vulnerabilityCategoryRepository;
        this.userRepository = userRepository;
        this.caregiverRelationshipRepository = caregiverRelationshipRepository;
        this.riskAssessmentEngine = riskAssessmentEngine;
        this.auditService = auditService;
    }
}
