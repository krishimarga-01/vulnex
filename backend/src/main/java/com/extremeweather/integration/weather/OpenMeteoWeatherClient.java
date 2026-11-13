package com.extremeweather.integration.weather;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;

@Component("openMeteoWeatherClient")
@Primary
public class OpenMeteoWeatherClient implements WeatherApiClient {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OpenMeteoWeatherClient.class);

    private final WebClient weatherWebClient;
    private final MockWeatherProvider mockWeatherProvider;

    @Value("${app.weather.provider:open-meteo}")
    private String configuredProvider;

    @Value("${app.weather.mock-fallback:true}")
    private boolean mockFallback;

    @Value("${app.weather.timeout-ms:5000}")
    private long timeoutMs;

    @Override
    public Mono<ExternalWeatherResponse> fetchCurrentWeather(double latitude, double longitude) {
        if ("mock".equalsIgnoreCase(configuredProvider)) {
            return mockWeatherProvider.fetchCurrentWeather(latitude, longitude);
        }

        String uri = String.format(
                "/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m",
                latitude, longitude);

        return weatherWebClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(ExternalWeatherResponse.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .map(resp -> {
                    resp.setLatitude(latitude);
                    resp.setLongitude(longitude);
                    resp.setIsSimulated(false);
                    resp.setTimestamp(Instant.now());
                    if (resp.getWeatherCondition() == null) {
                        resp.setWeatherCondition(deriveCondition(resp.getTemperature(), resp.getPrecipitation(), resp.getWindSpeed()));
                    }
                    return resp;
                })
                .doOnError(err -> log.warn("External weather API call failed ({}). Evaluating fallback.", err.getMessage()))
                .onErrorResume(err -> {
                    if (mockFallback) {
                        log.info("Falling back to identified mock weather provider.");
                        return mockWeatherProvider.fetchCurrentWeather(latitude, longitude);
                    }
                    return Mono.error(err);
                });
    }

    private String deriveCondition(Double temp, Double precip, Double wind) {
        if (temp != null && temp >= 42.0) return "Extreme Heatwave";
        if (precip != null && precip >= 25.0) return "Torrential Rainfall";
        if (wind != null && wind >= 50.0) return "High Gale Force Storm";
        return "Normal / Moderate Conditions";
    }

    @Override
    public String getProviderName() {
        return "OPEN_METEO_OFFICIAL_INTEGRATION";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    public OpenMeteoWeatherClient(WebClient weatherWebClient, MockWeatherProvider mockWeatherProvider) {
        this.weatherWebClient = weatherWebClient;
        this.mockWeatherProvider = mockWeatherProvider;
    }

}
