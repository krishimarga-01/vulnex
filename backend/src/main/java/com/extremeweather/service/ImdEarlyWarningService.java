package com.extremeweather.service;

import com.extremeweather.dto.ImdStatusDto;
import com.extremeweather.dto.ImdWarningDto;
import com.extremeweather.entity.GeographicalRegion;
import com.extremeweather.entity.VulnerablePerson;
import com.extremeweather.entity.WeatherAlert;
import com.extremeweather.entity.WeatherEventTypeEntity;
import com.extremeweather.integration.notification.NotificationDispatcher;
import com.extremeweather.integration.weather.ImdEarlyWarningClient;
import com.extremeweather.repository.GeographicalRegionRepository;
import com.extremeweather.repository.VulnerablePersonRepository;
import com.extremeweather.repository.WeatherAlertRepository;
import com.extremeweather.repository.WeatherEventTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ImdEarlyWarningService {
    private static final Logger log = LoggerFactory.getLogger(ImdEarlyWarningService.class);

    private final ImdEarlyWarningClient imdClient;
    private final WeatherAlertRepository weatherAlertRepository;
    private final WeatherEventTypeRepository weatherEventTypeRepository;
    private final GeographicalRegionRepository geographicalRegionRepository;
    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final NotificationDispatcher notificationDispatcher;

    private OffsetDateTime lastCheckedTime = OffsetDateTime.now();
    private final Map<String, ImdWarningDto> activeWarningsCache = new ConcurrentHashMap<>();

    public ImdEarlyWarningService(
            ImdEarlyWarningClient imdClient,
            WeatherAlertRepository weatherAlertRepository,
            WeatherEventTypeRepository weatherEventTypeRepository,
            GeographicalRegionRepository geographicalRegionRepository,
            VulnerablePersonRepository vulnerablePersonRepository,
            NotificationDispatcher notificationDispatcher) {
        this.imdClient = imdClient;
        this.weatherAlertRepository = weatherAlertRepository;
        this.weatherEventTypeRepository = weatherEventTypeRepository;
        this.geographicalRegionRepository = geographicalRegionRepository;
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.notificationDispatcher = notificationDispatcher;
    }

    /**
     * Centralized scheduled poll of official Indian Meteorological Department bulletins.
     * Executes every 15 minutes in Spring Boot backend.
     */
    @Scheduled(cron = "${app.imd.polling-cron:0 */15 * * * *}")
    @Transactional
    public void scheduledImdMonitoring() {
        log.info("Starting centralized IMD Early Warning monitoring poll...");
        syncImdBulletinsInternal();
    }

    /**
     * Synchronizes and persists IMD warnings to PostgreSQL.
     */
    @Transactional
    public List<ImdWarningDto> syncImdBulletinsNow() {
        log.info("Manual/on-demand IMD sync initiated by authority official...");
        return syncImdBulletinsInternal();
    }

    private synchronized List<ImdWarningDto> syncImdBulletinsInternal() {
        lastCheckedTime = OffsetDateTime.now();
        List<ImdWarningDto> fetchedWarnings = imdClient.fetchOfficialImdDistrictWarnings();
        List<GeographicalRegion> regions = geographicalRegionRepository.findAll();
        List<VulnerablePerson> allVulnerable = vulnerablePersonRepository.findAll();

        List<WeatherEventTypeEntity> eventTypes = weatherEventTypeRepository.findAll();
        WeatherEventTypeEntity defaultEvent = !eventTypes.isEmpty() ? eventTypes.get(0) : null;

        List<ImdWarningDto> synchronizedList = new ArrayList<>();

        for (ImdWarningDto dto : fetchedWarnings) {
            try {
                // Match with registered Indian district
                String district = dto.getDistrict();
                List<VulnerablePerson> affectedInDistrict = allVulnerable.stream()
                        .filter(p -> p.getDistrict() != null && p.getDistrict().equalsIgnoreCase(district))
                        .collect(Collectors.toList());

                dto.setAffectedVulnerableCount(affectedInDistrict.size());
                Set<String> categories = affectedInDistrict.stream()
                        .map(p -> p.getPrimaryCategory() != null ? p.getPrimaryCategory().getCategoryCode() : "GENERAL")
                        .collect(Collectors.toSet());
                dto.setAffectedCategories(new ArrayList<>(categories));

                String dbSeverity = "WARNING";
                if ("RED".equalsIgnoreCase(dto.getImdColorCode())) dbSeverity = "EMERGENCY";
                else if ("ORANGE".equalsIgnoreCase(dto.getImdColorCode())) dbSeverity = "WARNING";
                else if ("YELLOW".equalsIgnoreCase(dto.getImdColorCode())) dbSeverity = "WATCH";
                else dbSeverity = "ADVISORY";

                // Deduplicate & Persist in PostgreSQL weather_alerts table
                Optional<WeatherAlert> existingAlert = weatherAlertRepository.findByExternalSourceId(dto.getExternalSourceId());
                WeatherAlert alert;
                if (existingAlert.isPresent()) {
                    alert = existingAlert.get();
                    alert.setSeverity(dbSeverity);
                    alert.setAlertStatus("ACTIVE");
                    alert.setInstruction(dto.getSafetyInstructions());
                } else {
                    alert = new WeatherAlert();
                    alert.setExternalSourceId(dto.getExternalSourceId());
                    alert.setAlertTitle(dto.getHeadline());
                    alert.setDescription(dto.getDescription());
                    alert.setInstruction(dto.getSafetyInstructions());
                    alert.setSeverity(dbSeverity);
                    alert.setStartTime(dto.getValidFrom());
                    alert.setExpirationTime(dto.getValidUntil());
                    alert.setAlertStatus("ACTIVE");

                    WeatherEventTypeEntity matchedEvent = eventTypes.stream()
                            .filter(e -> e.getEventCode().equalsIgnoreCase(dto.getWarningType()))
                            .findFirst()
                            .orElse(defaultEvent);
                    alert.setEventType(matchedEvent);
                }

                weatherAlertRepository.save(alert);
                activeWarningsCache.put(dto.getDistrict().toLowerCase(), dto);
                synchronizedList.add(dto);

                // If ORANGE or RED alert: dispatch targeted notifications to vulnerable persons in district
                if ("RED".equalsIgnoreCase(dto.getImdColorCode()) || "ORANGE".equalsIgnoreCase(dto.getImdColorCode())) {
                    for (VulnerablePerson p : affectedInDistrict) {
                        com.extremeweather.entity.User user = p.getRegisteredBy();
                        if (user != null) {
                            try {
                                notificationDispatcher.dispatchAlert(
                                        user,
                                        "VULNEX IMD Alert [" + dto.getImdColorCode() + "]",
                                        dto.getHeadline() + ". Immediate safety: " + dto.getSafetyInstructions(),
                                        "WEATHER_WARNING",
                                        alert.getAlertId()
                                );
                            } catch (Exception notifEx) {
                                log.warn("Non-fatal notification dispatch notice: {}", notifEx.getMessage());
                            }
                        }
                    }
                }

            } catch (Exception ex) {
                log.error("Error processing IMD warning for district {}: {}", dto.getDistrict(), ex.getMessage(), ex);
            }
        }

        log.info("IMD Centralized Monitoring completed: {} active warnings synchronized to database.", synchronizedList.size());
        return synchronizedList;
    }

    /**
     * Retrieve all active official IMD warnings.
     */
    public List<ImdWarningDto> getActiveImdWarnings() {
        if (activeWarningsCache.isEmpty()) {
            return syncImdBulletinsInternal();
        }
        return new ArrayList<>(activeWarningsCache.values());
    }

    /**
     * Retrieve IMD warning status for a specific Indian state and district.
     */
    public ImdWarningDto getWarningForDistrict(String state, String district) {
        if (district == null) return null;
        String key = district.trim().toLowerCase();
        ImdWarningDto warning = activeWarningsCache.get(key);
        if (warning == null) {
            // Check through active warnings
            List<ImdWarningDto> all = getActiveImdWarnings();
            return all.stream()
                    .filter(w -> w.getDistrict() != null && w.getDistrict().equalsIgnoreCase(district))
                    .findFirst()
                    .orElse(new ImdWarningDto(
                            "IMD-NO-WARN-" + district,
                            state != null ? state : "Karnataka",
                            district,
                            "NORMAL",
                            "GREEN",
                            "LOW",
                            "No Active Severe Weather Warning",
                            "Current conditions within seasonal normal. No heavy rain or severe warning issued by IMD for " + district + ".",
                            "Maintain standard weather awareness.",
                            OffsetDateTime.now(),
                            OffsetDateTime.now().plusHours(24),
                            OffsetDateTime.now(),
                            "https://mausam.imd.gov.in/",
                            "ACTIVE",
                            0,
                            Collections.emptyList()
                    ));
        }
        return warning;
    }

    /**
     * Retrieve monitoring status metrics.
     */
    public ImdStatusDto getMonitoringStatus() {
        return new ImdStatusDto(
                true,
                lastCheckedTime,
                lastCheckedTime.plusMinutes(15),
                activeWarningsCache.size(),
                5, // Monitored districts
                "India Meteorological Department (https://mausam.imd.gov.in)",
                "15 minutes (Centralized Backend Polling)"
        );
    }
}
