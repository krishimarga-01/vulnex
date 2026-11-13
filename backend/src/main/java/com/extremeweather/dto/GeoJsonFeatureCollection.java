package com.extremeweather.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GeoJsonFeatureCollection {

    private String type = "FeatureCollection";

    private List<GeoJsonFeature> features = new ArrayList<>();

    public GeoJsonFeatureCollection() {}


    public GeoJsonFeatureCollection(String type, List<GeoJsonFeature> features) {
        this.type = type;
        this.features = features;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public List<GeoJsonFeature> getFeatures() { return features; }
    public void setFeatures(List<GeoJsonFeature> features) { this.features = features; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String type = "FeatureCollection";
        private List<GeoJsonFeature> features = new ArrayList<>();
        public Builder type(String type) { this.type = type; return this; }
        public Builder features(List<GeoJsonFeature> features) { this.features = features; return this; }
        public GeoJsonFeatureCollection build() {
            return new GeoJsonFeatureCollection(type, features);
        }
    }

}
