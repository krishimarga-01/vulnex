package com.extremeweather.dto;

import java.util.HashMap;
import java.util.Map;

public class GeoJsonFeature {

    private String type = "Feature";
    private GeometryDto geometry;
    private Map<String, Object> properties = new HashMap<>();

    public static class GeometryDto {
        private String type; // Point, Polygon, MultiPolygon
        private Object coordinates;

        public GeometryDto() {}

        public GeometryDto(String type, Object coordinates) {
            this.type = type;
            this.coordinates = coordinates;
        }

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private String type;
            private Object coordinates;

            public Builder type(String type) { this.type = type; return this; }
            public Builder coordinates(Object coordinates) { this.coordinates = coordinates; return this; }
            public GeometryDto build() { return new GeometryDto(type, coordinates); }
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Object getCoordinates() { return coordinates; }
        public void setCoordinates(Object coordinates) { this.coordinates = coordinates; }
    }

    public GeoJsonFeature() {}

    public GeoJsonFeature(String type, GeometryDto geometry, Map<String, Object> properties) {
        this.type = type != null ? type : "Feature";
        this.geometry = geometry;
        this.properties = properties != null ? properties : new HashMap<>();
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public GeometryDto getGeometry() { return geometry; }
    public void setGeometry(GeometryDto geometry) { this.geometry = geometry; }
    public Map<String, Object> getProperties() { return properties; }
    public void setProperties(Map<String, Object> properties) { this.properties = properties; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String type = "Feature";
        private GeometryDto geometry;
        private Map<String, Object> properties = new HashMap<>();

        public Builder type(String type) { this.type = type; return this; }
        public Builder geometry(GeometryDto geometry) { this.geometry = geometry; return this; }
        public Builder properties(Map<String, Object> properties) { this.properties = properties; return this; }
        public GeoJsonFeature build() { return new GeoJsonFeature(type, geometry, properties); }
    }
}
