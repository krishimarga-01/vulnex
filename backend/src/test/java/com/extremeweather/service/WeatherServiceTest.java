package com.extremeweather.service;

import com.extremeweather.dto.WeatherAlertRequest;
import com.extremeweather.dto.WeatherAlertResponse;
import com.extremeweather.entity.AlertType;
import com.extremeweather.entity.SeverityLevel;
import com.extremeweather.entity.WeatherAlert;
import com.extremeweather.integration.notification.NotificationDispatcher;
import com.extremeweather.integration.weather.WeatherApiClient;
import com.extremeweather.repository.GeographicalRegionRepository;
import com.extremeweather.repository.VulnerablePersonRepository;
import com.extremeweather.repository.WeatherAlertRepository;
import com.extremeweather.repository.WeatherObservationRepository;
import com.extremeweather.risk.RiskAssessmentEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

    @Mock
    private WeatherApiClient weatherApiClient;

    @Mock
    private WeatherObservationRepository observationRepository;

    @Mock
    private WeatherAlertRepository alertRepository;

    @Mock
    private com.extremeweather.repository.WeatherEventTypeRepository weatherEventTypeRepository;

    @Mock
    private GeographicalRegionRepository regionRepository;

    @Mock
    private VulnerablePersonRepository vulnerablePersonRepository;

    @Mock
    private RiskAssessmentEngine riskAssessmentEngine;

    @Mock
    private NotificationDispatcher notificationDispatcher;

    @InjectMocks
    private WeatherService weatherService;

    @Test
    @DisplayName("Should publish weather alert and trigger risk reassessment")
    void testCreateWeatherAlert() {
        UUID alertId = UUID.randomUUID();

        WeatherAlertRequest request = WeatherAlertRequest.builder()
                .alertCode("ALT-TEST-99")
                .alertType(AlertType.FLOOD)
                .severity(SeverityLevel.SEVERE)
                .headline("Severe River Inundation Alert")
                .description("Canal water level rising above danger mark")
                .affectedRegionName("Riverside Basin")
                .centerLatitude(13.045)
                .centerLongitude(80.220)
                .radiusKm(10.0)
                .effectiveFrom(Instant.now())
                .effectiveUntil(Instant.now().plusSeconds(43200))
                .build();

        WeatherAlert savedAlert = WeatherAlert.builder()
                .id(alertId)
                .alertCode("ALT-TEST-99")
                .alertType(AlertType.FLOOD)
                .severity(SeverityLevel.SEVERE)
                .headline("Severe River Inundation Alert")
                .description("Canal water level rising above danger mark")
                .affectedRegionName("Riverside Basin")
                .centerLatitude(13.045)
                .centerLongitude(80.220)
                .radiusKm(10.0)
                .effectiveFrom(Instant.now())
                .effectiveUntil(Instant.now().plusSeconds(43200))
                .isActive(true)
                .build();

        when(alertRepository.save(any(WeatherAlert.class))).thenReturn(savedAlert);
        when(weatherEventTypeRepository.findByEventCode(anyString())).thenReturn(Optional.of(
                new com.extremeweather.entity.WeatherEventTypeEntity(UUID.randomUUID(), "FLOOD", "Flood", "Flood severity")));
        when(regionRepository.findAll()).thenReturn(Collections.emptyList());
        when(vulnerablePersonRepository.findAll()).thenReturn(Collections.emptyList());

        WeatherAlertResponse response = weatherService.createWeatherAlert(request);

        assertNotNull(response);
        assertEquals("ALT-TEST-99", response.getAlertCode());
        assertEquals(AlertType.FLOOD, response.getAlertType());
        verify(riskAssessmentEngine, times(1)).reassessPersonsAffectedByAlert(any(WeatherAlert.class));
    }
}