package com.extremeweather.integration.weather;

import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Component("mockWeatherProvider")
public class MockWeatherProvider implements WeatherApiClient {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MockWeatherProvider.class);

    @Override
    public Mono<ExternalWeatherResponse> fetchCurrentWeather(double latitude, double longitude) {
        log.info("[DEMO/SIMULATION] Providing clearly identified mock weather observation for coords: {}, {}", latitude, longitude);

        // Deterministic simulation based on coordinate bounds (heatwave, heavy rain, or storm)
        double temp = latitude > 13.07 ? 43.8 : 38.5;
        double rain = latitude <= 13.05 ? 45.0 : 0.0;
        String condition = temp >= 40.0 ? "Extreme Heatwave Warning" :
                (rain > 20.0 ? "Heavy Monsoon Downpour" : "Severe Coastal Winds");

        return Mono.just(ExternalWeatherResponse.builder()
                .latitude(latitude)
                .longitude(longitude)
                .temperature(temp)
                .feelsLike(temp + 5.0)
                .precipitation(rain)
                .humidity(78.0)
                .windSpeed(34.0)
                .weatherCondition(condition)
                .isSimulated(true)
                .timestamp(Instant.now())
                .build());
    }

    @Override
    public String getProviderName() {
        return "MOCK_WEATHER_PROVIDER (SIMULATED DATA FOR DEMO)";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
