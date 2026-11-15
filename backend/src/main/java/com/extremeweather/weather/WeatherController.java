package com.extremeweather.weather;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class WeatherController {

    private final WeatherService weatherService;
    private final AirQualityService airQualityService;

    public WeatherController(WeatherService weatherService, AirQualityService airQualityService) {
        this.weatherService = weatherService;
        this.airQualityService = airQualityService;
    }

    /**
     * Endpoint 1: Current weather via Open-Meteo
     * Purpose: Current weather
     */
    @GetMapping({"/api/weather/current", "/api/v1/weather/current"})
    public ResponseEntity<WeatherResponse> getCurrentWeather(
            @RequestParam(defaultValue = "12.4244") double latitude,
            @RequestParam(defaultValue = "75.7382") double longitude
    ) {
        WeatherResponse weather = weatherService.getCurrentWeather(latitude, longitude);
        return ResponseEntity.ok(weather);
    }

    /**
     * Endpoint 2: Current AQI via Central Pollution Control Board (CPCB) Standard
     * Purpose: Current AQI
     */
    @GetMapping({"/api/air-quality/current", "/api/v1/air-quality/current"})
    public ResponseEntity<WeatherResponse> getCurrentAirQuality(
            @RequestParam(defaultValue = "12.4244") double latitude,
            @RequestParam(defaultValue = "75.7382") double longitude
    ) {
        WeatherResponse aqi = airQualityService.getCurrentAirQuality(latitude, longitude);
        return ResponseEntity.ok(aqi);
    }

    /**
     * Endpoint 3: Combined weather + AQI
     * Purpose: Combined weather + AQI
     */
    @GetMapping({"/api/environment/current", "/api/v1/environment/current"})
    public ResponseEntity<WeatherResponse> getCurrentEnvironment(
            @RequestParam(defaultValue = "12.4244") double latitude,
            @RequestParam(defaultValue = "75.7382") double longitude
    ) {
        WeatherResponse weather = weatherService.getCurrentWeather(latitude, longitude);
        WeatherResponse aqi = airQualityService.getCurrentAirQuality(latitude, longitude);

        // Merge weather + AQI into unified environment response
        weather.setAqi(aqi.getAqi());
        weather.setAqiCategory(aqi.getAqiCategory());
        weather.setAqiColor(aqi.getAqiColor());
        weather.setPm25(aqi.getPm25());
        weather.setPm10(aqi.getPm10());
        weather.setNo2(aqi.getNo2());
        weather.setSo2(aqi.getSo2());
        weather.setCo(aqi.getCo());
        weather.setO3(aqi.getO3());
        weather.setDataSource("Open-Meteo & Central Pollution Control Board (CPCB)");

        return ResponseEntity.ok(weather);
    }

    /**
     * Endpoint 4: Future weather and AQI
     * Purpose: Future weather and AQI
     */
    @GetMapping({"/api/environment/forecast", "/api/v1/environment/forecast"})
    public ResponseEntity<WeatherResponse> getEnvironmentForecast(
            @RequestParam(defaultValue = "12.4244") double latitude,
            @RequestParam(defaultValue = "75.7382") double longitude
    ) {
        WeatherResponse weather = weatherService.getCurrentWeather(latitude, longitude);
        WeatherResponse aqi = airQualityService.getCurrentAirQuality(latitude, longitude);

        weather.setAqi(aqi.getAqi());
        weather.setAqiCategory(aqi.getAqiCategory());
        weather.setAqiColor(aqi.getAqiColor());
        weather.setPm25(aqi.getPm25());
        weather.setPm10(aqi.getPm10());
        weather.setNo2(aqi.getNo2());
        weather.setSo2(aqi.getSo2());
        weather.setCo(aqi.getCo());
        weather.setO3(aqi.getO3());

        return ResponseEntity.ok(weather);
    }
}
