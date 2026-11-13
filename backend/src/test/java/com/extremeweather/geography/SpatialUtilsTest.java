package com.extremeweather.geography;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SpatialUtilsTest {

    @Test
    @DisplayName("Should accurately calculate Haversine distance in kilometers")
    void testHaversineDistance() {
        // Distance between Chennai (13.0827, 80.2707) and Bangalore (12.9716, 77.5946) ~ 290 km
        double distance = SpatialUtils.haversineDistanceKm(13.0827, 80.2707, 12.9716, 77.5946);
        assertTrue(distance > 280.0 && distance < 310.0, "Distance should be approx 290km");
    }

    @Test
    @DisplayName("Should detect if point is within circular radius")
    void testIsWithinRadius() {
        double centerLat = 13.0827;
        double centerLon = 80.2707;

        // Point ~1.5 km away
        double nearbyLat = 13.0900;
        double nearbyLon = 80.2750;
        assertTrue(SpatialUtils.isWithinRadius(nearbyLat, nearbyLon, centerLat, centerLon, 5.0));

        // Point 50 km away
        assertFalse(SpatialUtils.isWithinRadius(13.5000, 80.8000, centerLat, centerLon, 10.0));
    }

    @Test
    @DisplayName("Should determine point inside simple polygon boundary")
    void testPointInPolygon() {
        // Simple bounding box polygon around city center
        List<double[]> polygon = List.of(
                new double[]{13.0, 80.0},
                new double[]{13.2, 80.0},
                new double[]{13.2, 80.4},
                new double[]{13.0, 80.4}
        );

        assertTrue(SpatialUtils.isPointInPolygon(13.1, 80.2, polygon), "Point inside bounding box");
        assertFalse(SpatialUtils.isPointInPolygon(13.5, 80.5, polygon), "Point outside bounding box");
    }
}
