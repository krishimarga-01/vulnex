package com.extremeweather.weather;

import org.springframework.stereotype.Service;

@Service("cpcbAirQualityService")
public class AirQualityService {

    private final AirQualityClient airQualityClient;

    public AirQualityService(AirQualityClient airQualityClient) {
        this.airQualityClient = airQualityClient;
    }

    public WeatherResponse getCurrentAirQuality(double latitude, double longitude) {
        return airQualityClient.fetchLiveAirQuality(latitude, longitude);
    }
}
