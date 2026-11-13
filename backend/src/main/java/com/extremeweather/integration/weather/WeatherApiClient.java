package com.extremeweather.integration.weather;

import reactor.core.publisher.Mono;

public interface WeatherApiClient {
    Mono<ExternalWeatherResponse> fetchCurrentWeather(double latitude, double longitude);
    String getProviderName();
    boolean isAvailable();
}
