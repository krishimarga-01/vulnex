package com.extremeweather.config;

import com.extremeweather.entity.*;
import com.extremeweather.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Component
@Profile({"dev", "test"})
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final GeographicalRegionRepository regionRepository;
    private final WeatherObservationRepository observationRepository;
    private final WeatherAlertRepository alertRepository;
    private final RiskScoringRuleRepository ruleRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final ResponseTeamRepository responseTeamRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private EmergencyCategoryRepository emergencyCategoryRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private VulnerabilityCategoryRepository vulnerabilityCategoryRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private WeatherEventTypeRepository weatherEventTypeRepository;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           VulnerablePersonRepository vulnerablePersonRepository,
                           GeographicalRegionRepository regionRepository,
                           WeatherObservationRepository observationRepository,
                           WeatherAlertRepository alertRepository,
                           RiskScoringRuleRepository ruleRepository,
                           EmergencyCaseRepository emergencyCaseRepository,
                           ResponseTeamRepository responseTeamRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.regionRepository = regionRepository;
        this.observationRepository = observationRepository;
        this.alertRepository = alertRepository;
        this.ruleRepository = ruleRepository;
        this.emergencyCaseRepository = emergencyCaseRepository;
        this.responseTeamRepository = responseTeamRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already populated. Skipping dev seed.");
            return;
        }

        log.info("Initializing comprehensive demonstration data for development/test environment...");

        // 1. Roles
        roleRepository.save(new Role(null, "ROLE_ADMIN", "System Administrator"));
        roleRepository.save(new Role(null, "ROLE_AUTHORITY", "Disaster Management Official"));
        roleRepository.save(new Role(null, "ROLE_CAREGIVER", "Registered Caregiver"));
        roleRepository.save(new Role(null, "ROLE_CITIZEN", "General Citizen"));
        roleRepository.save(new Role(null, "ROLE_VOLUNTEER", "First Responder Volunteer"));

        // Categories
        if (vulnerabilityCategoryRepository != null && vulnerabilityCategoryRepository.count() == 0) {
            vulnerabilityCategoryRepository.save(new VulnerabilityCategoryEntity(null, "ELDERLY", "Elderly Individuals (65+)", 3));
            vulnerabilityCategoryRepository.save(new VulnerabilityCategoryEntity(null, "CHILD", "Children and Infants", 2));
            vulnerabilityCategoryRepository.save(new VulnerabilityCategoryEntity(null, "PERSON_WITH_DISABILITY", "Person with Disability", 4));
            vulnerabilityCategoryRepository.save(new VulnerabilityCategoryEntity(null, "PREGNANT_WOMAN", "Pregnant Woman", 3));
            vulnerabilityCategoryRepository.save(new VulnerabilityCategoryEntity(null, "MEDICAL_ASSISTANCE_REQUIRED", "Chronic Illness / Medical", 5));
        }
        if (emergencyCategoryRepository != null && emergencyCategoryRepository.count() == 0) {
            emergencyCategoryRepository.save(new EmergencyCategoryEntity(null, "MEDICAL_ASSISTANCE", "Emergency Medical Evacuation", 5));
            emergencyCategoryRepository.save(new EmergencyCategoryEntity(null, "RESCUE", "Immediate Flood/Structural Rescue", 5));
            emergencyCategoryRepository.save(new EmergencyCategoryEntity(null, "EVACUATION", "Preemptive Hazard Evacuation", 4));
            emergencyCategoryRepository.save(new EmergencyCategoryEntity(null, "FOOD_WATER", "Emergency Rations & Potable Water", 2));
            emergencyCategoryRepository.save(new EmergencyCategoryEntity(null, "SHELTER", "Emergency Safe Shelter Access", 3));
        }
        if (weatherEventTypeRepository != null && weatherEventTypeRepository.count() == 0) {
            weatherEventTypeRepository.save(new WeatherEventTypeEntity(null, "CYCLONE", "Tropical Cyclone", "IMD Cyclone Classification"));
            weatherEventTypeRepository.save(new WeatherEventTypeEntity(null, "FLOOD", "Inundation & Urban Flash Flood", "Water logging depths"));
            weatherEventTypeRepository.save(new WeatherEventTypeEntity(null, "EXTREME_HEAT", "Heatwave & Extreme Temperature", "IMD Heatwave Warning"));
            weatherEventTypeRepository.save(new WeatherEventTypeEntity(null, "HEAVY_RAINFALL", "Heavy / Very Heavy Rainfall", "IMD Rainfall scale"));
            weatherEventTypeRepository.save(new WeatherEventTypeEntity(null, "SEVERE_STORM", "Severe Thunderstorm & Gale", "Wind speeds > 60km/h"));
        }

        // 2. Users (Password: Password@123)
        String passHash = passwordEncoder.encode("Password@123");
        User admin = userRepository.save(new User(null, "admin", "admin@gov.org", passHash, "Admin Controller", "+1-555-0100", RoleEnum.ROLE_ADMIN, AccountStatus.ACTIVE, "HQ Dispatch", "+1-555-0109", null, Instant.now(), Instant.now()));
        User authority = userRepository.save(new User(null, "officer_raj", "officer.raj@gov.org", passHash, "Rajesh Sharma", "+1-555-0101", RoleEnum.ROLE_AUTHORITY, AccountStatus.ACTIVE, "Ops Center", "+1-555-0108", null, Instant.now(), Instant.now()));
        User caregiver = userRepository.save(new User(null, "caregiver_mary", "mary@example.com", passHash, "Mary Johnson", "+1-555-0102", RoleEnum.ROLE_CAREGIVER, AccountStatus.ACTIVE, "Clinic", "+1-555-0110", null, Instant.now(), Instant.now()));
        User citizen = userRepository.save(new User(null, "citizen_john", "john@example.com", passHash, "John Doe", "+1-555-0103", RoleEnum.ROLE_CITIZEN, AccountStatus.ACTIVE, "Family", "+1-555-0111", null, Instant.now(), Instant.now()));
        User volunteer = userRepository.save(new User(null, "volunteer_sarah", "sarah@example.com", passHash, "Sarah Connor", "+1-555-0104", RoleEnum.ROLE_VOLUNTEER, AccountStatus.ACTIVE, "Red Cross", "+1-555-0112", null, Instant.now(), Instant.now()));

        // 3. Scoring Rules
        ruleRepository.save(new RiskScoringRule(null, "AGE_ELDERLY_EXTREME", "AGE", "Elderly 75+", "age", "GREATER_THAN_EQUAL", "75", 20.0, true, Instant.now(), Instant.now()));
        ruleRepository.save(new RiskScoringRule(null, "AGE_CHILD_INFANT", "AGE", "Infants < 5", "age", "LESS_THAN_EQUAL", "5", 15.0, true, Instant.now(), Instant.now()));
        ruleRepository.save(new RiskScoringRule(null, "VULN_DISABILITY", "VULNERABILITY_TYPE", "Disability", "vulnerabilityCategory", "EQUALS", "DISABILITY", 25.0, true, Instant.now(), Instant.now()));
        ruleRepository.save(new RiskScoringRule(null, "VULN_MEDICAL", "VULNERABILITY_TYPE", "Medical Dependency", "vulnerabilityCategory", "EQUALS", "MEDICAL_ASSISTANCE", 25.0, true, Instant.now(), Instant.now()));
        ruleRepository.save(new RiskScoringRule(null, "VULN_PREGNANT", "VULNERABILITY_TYPE", "Pregnancy", "vulnerabilityCategory", "EQUALS", "PREGNANT", 20.0, true, Instant.now(), Instant.now()));
        ruleRepository.save(new RiskScoringRule(null, "MOBILITY_BEDRIDDEN", "MOBILITY", "Bedridden", "mobilityStatus", "EQUALS", "BEDRIDDEN", 30.0, true, Instant.now(), Instant.now()));
        ruleRepository.save(new RiskScoringRule(null, "MOBILITY_WHEELCHAIR", "MOBILITY", "Wheelchair", "mobilityStatus", "EQUALS", "WHEELCHAIR", 20.0, true, Instant.now(), Instant.now()));
        ruleRepository.save(new RiskScoringRule(null, "WEATHER_HEAT_EXTREME", "WEATHER_SEVERITY", "Extreme Heat", "weatherSeverity", "EQUALS", "EXTREME", 25.0, true, Instant.now(), Instant.now()));
        ruleRepository.save(new RiskScoringRule(null, "SUPPORT_NO_CAREGIVER", "SUPPORT_AVAILABILITY", "No Caregiver", "caregiverAssigned", "EQUALS", "FALSE", 15.0, true, Instant.now(), Instant.now()));

        // 4. Response Teams
        ResponseTeam r1 = responseTeamRepository.save(new ResponseTeam(null, "Coastal Rapid Rescue Unit 1", "RESCUE", "+1-555-9001", "Harbor Station", true, 8, Instant.now()));
        ResponseTeam r2 = responseTeamRepository.save(new ResponseTeam(null, "Mobile Critical Care Unit Alpha", "MEDICAL", "+1-555-9002", "General Hospital East Wing", true, 5, Instant.now()));

        // 5. Geographical Regions
        GeographicalRegion region1 = regionRepository.save(new GeographicalRegion(null, "Coastal Ward Sector 4", "RGN-COAST-04", RegionType.WARD, 13.0827, 80.2707, null, RiskLevel.HIGH, 1, 45000, Instant.now(), Instant.now()));
        GeographicalRegion region2 = regionRepository.save(new GeographicalRegion(null, "Riverside Lowland Basin", "RGN-RIVER-02", RegionType.MUNICIPALITY, 13.0450, 80.2200, null, RiskLevel.MEDIUM, 0, 32000, Instant.now(), Instant.now()));

        // 6. Vulnerable Persons
        VulnerabilityCategoryEntity elderlyCat = vulnerabilityCategoryRepository != null ?
                vulnerabilityCategoryRepository.findByCategoryCode("ELDERLY").orElse(null) : null;
        VulnerabilityCategoryEntity childCat = vulnerabilityCategoryRepository != null ?
                vulnerabilityCategoryRepository.findByCategoryCode("CHILD").orElse(null) : null;
        VulnerabilityCategoryEntity pregnantCat = vulnerabilityCategoryRepository != null ?
                vulnerabilityCategoryRepository.findByCategoryCode("PREGNANT_WOMAN").orElse(null) : null;

        VulnerablePerson p1 = new VulnerablePerson(null, "NAT-ID-1001", "Eleanor Vance", 82, LocalDate.of(1944, 3, 15), "FEMALE", VulnerabilityCategory.ELDERLY, "Congestive heart failure, needs supplemental oxygen", MobilityStatus.BEDRIDDEN, "Electric oxygen concentrator", "+1-555-3001", "12 Marina Beach Road, Coastal Sector 4", "Mary Johnson", "+1-555-0102", "Daughter", 13.0830, 80.2710, caregiver, caregiver, VerificationStatus.VERIFIED, true, RiskLevel.HIGH, 85.0, Instant.now(), Instant.now());
        p1.setPrimaryCategory(elderlyCat);
        p1 = vulnerablePersonRepository.save(p1);

        VulnerablePerson p2 = new VulnerablePerson(null, "NAT-ID-1002", "Thomas Miller", 4, LocalDate.of(2022, 6, 10), "MALE", VulnerabilityCategory.CHILD, "Asthma", MobilityStatus.INDEPENDENT, "Pediatric nebulizer", "+1-555-3002", "45 Riverbed Lane, Riverside Lowland", "John Doe", "+1-555-0103", "Father", 13.0460, 80.2210, citizen, null, VerificationStatus.VERIFIED, true, RiskLevel.MEDIUM, 55.0, Instant.now(), Instant.now());
        p2.setPrimaryCategory(childCat);
        p2 = vulnerablePersonRepository.save(p2);

        VulnerablePerson p3 = new VulnerablePerson(null, "NAT-ID-1003", "Amina Begum", 28, LocalDate.of(1998, 8, 22), "FEMALE", VulnerabilityCategory.PREGNANT, "Late term pregnancy (36 weeks)", MobilityStatus.INDEPENDENT, "Obstetric transport", "+1-555-3003", "88 Lighthouse Hill, Coastal Sector 4", "Farhan Begum", "+1-555-3004", "Spouse", 13.0845, 80.2730, citizen, null, VerificationStatus.VERIFIED, true, RiskLevel.HIGH, 75.0, Instant.now(), Instant.now());
        p3.setPrimaryCategory(pregnantCat);
        p3 = vulnerablePersonRepository.save(p3);

        // 7. Weather Observation & Alert
        WeatherEventTypeEntity heatwaveType = weatherEventTypeRepository != null ?
                weatherEventTypeRepository.findByEventCode("EXTREME_HEAT").orElse(null) : null;
        EmergencyCategoryEntity medicalCat = emergencyCategoryRepository != null ?
                emergencyCategoryRepository.findByCategoryCode("MEDICAL_ASSISTANCE").orElse(null) : null;

        observationRepository.save(new WeatherObservation(null, region1, region1.getName(), 13.0827, 80.2707, 43.5, 48.2, 0.0, 78.0, 32.0, "Extreme Heatwave", false, Instant.now()));
        WeatherAlert alert = new WeatherAlert(null, "ALERT-HW-2026-001", AlertType.HEATWAVE, SeverityLevel.EXTREME, "RED ALERT: Critical Heatwave Conditions Exceeding 43°C", "Dangerous heat wave conditions", "Stay indoors, drink electrolytes", "Coastal Ward Sector 4", null, 13.0827, 80.2707, 15.0, Instant.now().minusSeconds(7200), Instant.now().plusSeconds(86400), true, authority, Instant.now());
        alert.setEventType(heatwaveType);
        alertRepository.save(alert);

        // 8. Emergency Cases
        EmergencyCase eCase = new EmergencyCase(null, "EC-2026-001", caregiver, p1, EmergencyCategory.MEDICAL_ASSISTANCE, "Power outage at residence; oxygen concentrator battery low.", EmergencyPriority.CRITICAL, 13.0830, 80.2710, "12 Marina Beach Road", CaseStatus.ASSIGNED, "Dispatched Medical Critical Care Unit Alpha", r2, Instant.now().minusSeconds(3600), Instant.now(), null);
        eCase.setCategory(medicalCat);
        emergencyCaseRepository.save(eCase);

        log.info("Demonstration dataset successfully loaded in dev/test environment.");
    }
}
