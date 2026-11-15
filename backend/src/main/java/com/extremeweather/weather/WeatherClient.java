package com.extremeweather.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class WeatherClient {

    private static final Logger log = LoggerFactory.getLogger(WeatherClient.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public WeatherClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public WeatherResponse fetchLiveWeather(double latitude, double longitude) {
        String url = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto",
                latitude, longitude
        );

        WeatherResponse response = new WeatherResponse();
        response.setLatitude(latitude);
        response.setLongitude(longitude);

        try {
            String rawJson = restTemplate.getForObject(url, String.class);
            if (rawJson != null) {
                JsonNode root = objectMapper.readTree(rawJson);
                response.setTimezone(root.path("timezone").asText("Asia/Kolkata"));

                JsonNode current = root.path("current");
                if (!current.isMissingNode()) {
                    response.setTemperature(current.path("temperature_2m").asDouble(28.0));
                    response.setFeelsLike(current.path("apparent_temperature").asDouble(response.getTemperature()));
                    response.setHumidity(current.path("relative_humidity_2m").asDouble(65.0));
                    response.setPrecipitation(current.path("precipitation").asDouble(0.0));
                    response.setWindSpeed(current.path("wind_speed_10m").asDouble(12.0));
                    response.setWindDirection(current.path("wind_direction_10m").asDouble(180.0));
                    response.setSurfacePressure(current.path("surface_pressure").asDouble(1013.25));

                    int code = current.path("weather_code").asInt(0);
                    response.setWeatherCode(code);
                    response.setWeatherCondition(mapWmoCodeToCondition(code));
                }

                // Parse next 12 hours
                JsonNode hourly = root.path("hourly");
                if (!hourly.isMissingNode()) {
                    JsonNode times = hourly.path("time");
                    JsonNode temps = hourly.path("temperature_2m");
                    JsonNode codes = hourly.path("weather_code");
                    JsonNode precipProbs = hourly.path("precipitation_probability");

                    List<WeatherResponse.HourlyForecast> list = new ArrayList<>();
                    int limit = Math.min(12, times.size());
                    for (int i = 0; i < limit; i++) {
                        String timeStr = times.path(i).asText();
                        double temp = temps.path(i).asDouble();
                        int code = codes.path(i).asInt();
                        double prob = precipProbs.path(i).asDouble(0.0);

                        String formattedTime = timeStr;
                        try {
                            LocalDateTime dt = LocalDateTime.parse(timeStr);
                            formattedTime = dt.format(DateTimeFormatter.ofPattern("ha"));
                        } catch (Exception ignored) {}

                        list.add(new WeatherResponse.HourlyForecast(
                                formattedTime,
                                temp,
                                code,
                                mapWmoCodeToCondition(code),
                                prob,
                                null
                        ));
                    }
                    response.setHourly(list);
                }
            }
        } catch (Exception e) {
            log.error("Failed to query Open-Meteo Weather API for {}, {}: {}", latitude, longitude, e.getMessage());
            // Fallback safe values
            response.setTemperature(27.5);
            response.setFeelsLike(28.2);
            response.setHumidity(70.0);
            response.setPrecipitation(0.0);
            response.setWindSpeed(10.0);
            response.setWeatherCode(1);
            response.setWeatherCondition("Mainly Clear");
        }

        return response;
    }

    public static String mapWmoCodeToCondition(int code) {
        return switch (code) {
            case 0 -> "Clear Sky";
            case 1 -> "Mainly Clear";
            case 2 -> "Partly Cloudy";
            case 3 -> "Overcast";
            case 45, 48 -> "Foggy / Mist";
            case 51, 53, 55 -> "Light Drizzle";
            case 56, 57 -> "Freezing Drizzle";
            case 61 -> "Slight Rain";
            case 63 -> "Moderate Rain";
            case 65 -> "Heavy Rain";
            case 71, 73, 75 -> "Snow Fall";
            case 80, 81, 82 -> "Rain Showers";
            case 95 -> "Thunderstorm";
            case 96, 99 -> "Severe Thunderstorm with Hail";
            default -> "Partly Cloudy";
        };
    }
}
