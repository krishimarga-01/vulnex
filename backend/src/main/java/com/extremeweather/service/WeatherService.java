package com.extremeweather.service;

import com.extremeweather.dto.WeatherAlertRequest;
import com.extremeweather.dto.WeatherAlertResponse;
import com.extremeweather.dto.WeatherObservationDto;
import com.extremeweather.entity.*;
import com.extremeweather.exception.ResourceNotFoundException;
import com.extremeweather.geography.SpatialUtils;
import com.extremeweather.integration.notification.NotificationDispatcher;
import com.extremeweather.integration.weather.ExternalWeatherResponse;
import com.extremeweather.integration.weather.WeatherApiClient;
import com.extremeweather.repository.*;
import com.extremeweather.risk.RiskAssessmentEngine;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WeatherService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(WeatherService.class);

    private final WeatherApiClient weatherApiClient;
    private final WeatherObservationRepository observationRepository;
    private final WeatherAlertRepository alertRepository;
    private final WeatherEventTypeRepository weatherEventTypeRepository;
    private final GeographicalRegionRepository regionRepository;
    private final VulnerablePersonRepository vulnerablePersonRepository;
    private final RiskAssessmentEngine riskAssessmentEngine;
    private final NotificationDispatcher notificationDispatcher;

    public WeatherService(WeatherApiClient weatherApiClient,
                          WeatherObservationRepository observationRepository,
                          WeatherAlertRepository alertRepository,
                          WeatherEventTypeRepository weatherEventTypeRepository,
                          GeographicalRegionRepository regionRepository,
                          VulnerablePersonRepository vulnerablePersonRepository,
                          RiskAssessmentEngine riskAssessmentEngine,
                          NotificationDispatcher notificationDispatcher) {
        this.weatherApiClient = weatherApiClient;
        this.observationRepository = observationRepository;
        this.alertRepository = alertRepository;
        this.weatherEventTypeRepository = weatherEventTypeRepository;
        this.regionRepository = regionRepository;
        this.vulnerablePersonRepository = vulnerablePersonRepository;
        this.riskAssessmentEngine = riskAssessmentEngine;
        this.notificationDispatcher = notificationDispatcher;
    }

    @Scheduled(cron = "${app.weather.polling-cron:0 */30 * * * *}")
    public void scheduledWeatherMonitoring() {
        log.info("Starting scheduled weather monitoring poll across active regions...");
        List<GeographicalRegion> regions = regionRepository.findAll();
        for (GeographicalRegion region : regions) {
            try {
                observeRegionWeather(region.getId());
            } catch (Exception e) {
                log.error("Failed to observe weather for region {}: {}", region.getName(), e.getMessage());
            }
        }
    }

    @Transactional
    public WeatherObservationDto observeRegionWeather(UUID regionId) {
        GeographicalRegion region = regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Region not found with id: " + regionId));

        ExternalWeatherResponse response = weatherApiClient
                .fetchCurrentWeather(region.getCenterLatitude(), region.getCenterLongitude())
                .block();

        if (response == null) {
            throw new IllegalStateException("Failed to retrieve weather data from provider: " + weatherApiClient.getProviderName());
        }

        WeatherObservation observation = WeatherObservation.builder()
                .region(region)
                .regionName(region.getName())
                .latitude(region.getCenterLatitude())
                .longitude(region.getCenterLongitude())
                .temperature(response.getTemperature() != null ? response.getTemperature() : 25.0)
                .feelsLike(response.getFeelsLike())
                .precipitation(response.getPrecipitation() != null ? response.getPrecipitation() : 0.0)
                .humidity(response.getHumidity() != null ? response.getHumidity() : 50.0)
                .windSpeed(response.getWindSpeed() != null ? response.getWindSpeed() : 10.0)
                .weatherCondition(response.getWeatherCondition() != null ? response.getWeatherCondition() : "Normal")
                .isSimulated(Boolean.TRUE.equals(response.getIsSimulated()))
                .observedAt(Instant.now())
                .build();

        observation = observationRepository.save(observation);

        checkAndTriggerAutoAlert(region, observation);

        return mapToObservationDto(observation);
    }

    private void checkAndTriggerAutoAlert(GeographicalRegion region, WeatherObservation obs) {
        if (obs.getTemperature() != null && obs.getTemperature() >= 42.0) {
            WeatherAlertRequest req = WeatherAlertRequest.builder()
                    .alertType(AlertType.HEATWAVE)
                    .severity(SeverityLevel.EXTREME)
                    .headline("CRITICAL HEATWAVE: Severe High Temperatures in " + region.getName())
                    .description(String.format("Temperature recorded at %.1f°C with heat index %.1f°C.",
                            obs.getTemperature(), obs.getFeelsLike() != null ? obs.getFeelsLike() : obs.getTemperature()))
                    .safetyInstructions("Stay indoors during 11:00-16:00, consume oral rehydration solutions, check on elderly.")
                    .affectedRegionName(region.getName())
                    .centerLatitude(region.getCenterLatitude())
                    .centerLongitude(region.getCenterLongitude())
                    .radiusKm(15.0)
                    .effectiveFrom(Instant.now())
                    .effectiveUntil(Instant.now().plusSeconds(86400))
                    .build();
            createAlertInternal(req);
        } else if (obs.getPrecipitation() != null && obs.getPrecipitation() >= 75.0) {
            WeatherAlertRequest req = WeatherAlertRequest.builder()
                    .alertType(AlertType.HEAVY_RAINFALL)
                    .severity(SeverityLevel.SEVERE)
                    .headline("FLASH FLOOD WARNING: Inundation Alert for " + region.getName())
                    .description(String.format("Heavy rainfall measured at %.1f mm/hr.", obs.getPrecipitation()))
                    .safetyInstructions("Avoid low-lying basements and riverbanks. Keep emergency grab bags ready.")
                    .affectedRegionName(region.getName())
                    .centerLatitude(region.getCenterLatitude())
                    .centerLongitude(region.getCenterLongitude())
                    .radiusKm(12.0)
                    .effectiveFrom(Instant.now())
                    .effectiveUntil(Instant.now().plusSeconds(43200))
                    .build();
            createAlertInternal(req);
        }
    }

    @Transactional
    public WeatherAlertResponse createWeatherAlert(WeatherAlertRequest request) {
        return createAlertInternal(request);
    }

    private WeatherAlertResponse createAlertInternal(WeatherAlertRequest request) {
        String alertCode = request.getAlertCode() != null ? request.getAlertCode() :
                "ALT-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        String code = "EXTREME_HEAT";
        if (request.getAlertType() == AlertType.HEAVY_RAINFALL) code = "HEAVY_RAINFALL";
        else if (request.getAlertType() == AlertType.FLOOD) code = "FLOOD";
        else if (request.getAlertType() == AlertType.CYCLONE) code = "CYCLONE";
        else if (request.getAlertType() == AlertType.SEVERE_STORM) code = "SEVERE_STORM";

        final String finalCode = code;
        WeatherEventTypeEntity eventType = weatherEventTypeRepository.findByEventCode(finalCode)
                .orElseGet(() -> weatherEventTypeRepository.findAll().stream().findFirst().orElse(null));

        WeatherAlert alert = WeatherAlert.builder()
                .alertCode(alertCode)
                .alertType(request.getAlertType())
                .severity(request.getSeverity())
                .headline(request.getHeadline())
                .description(request.getDescription())
                .safetyInstructions(request.getSafetyInstructions())
                .affectedRegionName(request.getAffectedRegionName())
                .boundaryGeoJson(request.getBoundaryGeoJson())
                .centerLatitude(request.getCenterLatitude())
                .centerLongitude(request.getCenterLongitude())
                .radiusKm(request.getRadiusKm() != null ? request.getRadiusKm() : 15.0)
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveUntil(request.getEffectiveUntil())
                .isActive(true)
                .issuedBy(null)
                .build();

        alert.setEventType(eventType);
        final WeatherAlert savedAlert = alertRepository.save(alert);
        log.info("New weather alert created: {} [{}]", savedAlert.getAlertCode(), savedAlert.getHeadline());

        regionRepository.findAll().stream()
                .filter(r -> r.getName().equalsIgnoreCase(savedAlert.getAffectedRegionName()))
                .findFirst()
                .ifPresent(r -> {
                    r.setActiveAlertCount(r.getActiveAlertCount() + 1);
                    regionRepository.save(r);
                });

        riskAssessmentEngine.reassessPersonsAffectedByAlert(savedAlert);

        dispatchAlertNotifications(savedAlert);

        return mapToAlertResponse(savedAlert);
    }

    private void dispatchAlertNotifications(WeatherAlert alert) {
        Double centerLat = alert.getCenterLatitude();
        Double centerLon = alert.getCenterLongitude();
        Double radiusKm = alert.getRadiusKm() != null ? alert.getRadiusKm() : 20.0;

        List<VulnerablePerson> affectedPersons;
        if (centerLat != null && centerLon != null) {
            affectedPersons = vulnerablePersonRepository.findAll().stream()
                    .filter(p -> SpatialUtils.isWithinRadius(p.getLatitude(), p.getLongitude(), centerLat, centerLon, radiusKm))
                    .collect(Collectors.toList());
        } else {
            affectedPersons = vulnerablePersonRepository.findAll();
        }

        for (VulnerablePerson p : affectedPersons) {
            if (p.getCaregiver() != null) {
                notificationDispatcher.dispatchAlert(
                        p.getCaregiver(),
                        "WEATHER ALERT: " + alert.getHeadline(),
                        alert.getDescription() + " Safety: " + alert.getSafetyInstructions(),
                        "WEATHER_ALERT",
                        alert.getId());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<WeatherAlertResponse> getActiveAlerts() {
        return alertRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeatherAlertResponse> getAllAlerts() {
        return alertRepository.findAll().stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WeatherAlertResponse deactivateAlert(UUID alertId) {
        WeatherAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Weather alert not found with id: " + alertId));
        alert.setIsActive(false);
        alert = alertRepository.save(alert);
        return mapToAlertResponse(alert);
    }

    private WeatherAlertResponse mapToAlertResponse(WeatherAlert alert) {
        return WeatherAlertResponse.builder()
                .id(alert.getId())
                .alertCode(alert.getAlertCode())
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .headline(alert.getHeadline())
                .description(alert.getDescription())
                .safetyInstructions(alert.getSafetyInstructions())
                .affectedRegionName(alert.getAffectedRegionName())
                .boundaryGeoJson(alert.getBoundaryGeoJson())
                .centerLatitude(alert.getCenterLatitude())
                .centerLongitude(alert.getCenterLongitude())
                .radiusKm(alert.getRadiusKm())
                .effectiveFrom(alert.getEffectiveFrom())
                .effectiveUntil(alert.getEffectiveUntil())
                .isActive(alert.getIsActive())
                .issuedByUserId(alert.getIssuedBy() != null ? alert.getIssuedBy().getId() : null)
                .issuedByUsername(alert.getIssuedBy() != null ? alert.getIssuedBy().getUsername() : "SYSTEM")
                .createdAt(alert.getCreatedAt())
                .build();
    }

    private WeatherObservationDto mapToObservationDto(WeatherObservation obs) {
        return WeatherObservationDto.builder()
                .id(obs.getId())
                .regionId(obs.getRegion() != null ? obs.getRegion().getId() : null)
                .regionName(obs.getRegionName())
                .latitude(obs.getLatitude())
                .longitude(obs.getLongitude())
                .temperature(obs.getTemperature())
                .feelsLike(obs.getFeelsLike())
                .precipitation(obs.getPrecipitation())
                .humidity(obs.getHumidity())
                .windSpeed(obs.getWindSpeed())
                .weatherCondition(obs.getWeatherCondition())
                .isSimulated(obs.getIsSimulated())
                .observedAt(obs.getObservedAt())
                .build();
    }
}
