package com.extremeweather.geography;

import com.extremeweather.dto.GeoJsonFeature;

import java.util.Collections;
import java.util.List;

public final class SpatialUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private SpatialUtils() {}

    /**
     * Calculates great-circle distance between two coordinates using the Haversine formula.
     */
    public static double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Checks if a point (lat, lon) is within a circular radius (km) of a center coordinate.
     */
    public static boolean isWithinRadius(double pointLat, double pointLon, double centerLat, double centerLon, double radiusKm) {
        return haversineDistanceKm(pointLat, pointLon, centerLat, centerLon) <= radiusKm;
    }

    /**
     * Ray-casting algorithm to test whether a coordinate is inside a polygon defined by list of vertices [lat, lon].
     */
    public static boolean isPointInPolygon(double pointLat, double pointLon, List<double[]> polygonVertices) {
        if (polygonVertices == null || polygonVertices.size() < 3) {
            return false;
        }

        boolean inside = false;
        int n = polygonVertices.size();
        for (int i = 0, j = n - 1; i < n; j = i++) {
            double xi = polygonVertices.get(i)[0], yi = polygonVertices.get(i)[1];
            double xj = polygonVertices.get(j)[0], yj = polygonVertices.get(j)[1];

            boolean intersect = ((yi > pointLon) != (yj > pointLon))
                    && (pointLat < (xj - xi) * (pointLon - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    /**
     * Creates a GeoJSON Point Geometry DTO.
     */
    public static GeoJsonFeature.GeometryDto createPointGeometry(double latitude, double longitude) {
        // In GeoJSON, coordinates order is [longitude, latitude]
        return GeoJsonFeature.GeometryDto.builder()
                .type("Point")
                .coordinates(List.of(longitude, latitude))
                .build();
    }
}
