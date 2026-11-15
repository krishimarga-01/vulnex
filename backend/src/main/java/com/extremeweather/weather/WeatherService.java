package com.extremeweather.weather;

import org.springframework.stereotype.Service;

@Service("openMeteoWeatherService")
public class WeatherService {

    private final WeatherClient weatherClient;

    public WeatherService(WeatherClient weatherClient) {
        this.weatherClient = weatherClient;
    }

    public WeatherResponse getCurrentWeather(double latitude, double longitude) {
        return weatherClient.fetchLiveWeather(latitude, longitude);
    }
}
