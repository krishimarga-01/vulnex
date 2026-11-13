package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "geographical_regions")
public class GeographicalRegion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "region_id", updatable = false, nullable = false)
    private UUID regionId;

    @Column(name = "region_code", nullable = false, unique = true, length = 50)
    private String regionCode;

    @Column(name = "region_name", nullable = false, length = 100)
    private String regionName;

    @Column(name = "state", nullable = false, length = 100)
    private String state = "Karnataka";

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "taluk", length = 100)
    private String taluk;

    @Column(name = "village_or_locality", length = 100)
    private String villageOrLocality;

    @Column(name = "boundary", columnDefinition = "geometry(MultiPolygon,4326)")
    private MultiPolygon boundary;

    @Column(name = "centroid", columnDefinition = "geometry(Point,4326)")
    private Point centroid;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "region_risk_level", nullable = false, length = 20)
    private String regionRiskLevel = "LOW";

    @Column(name = "elevation_meters", precision = 8, scale = 2)
    private BigDecimal elevationMeters;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Transient compatibility fields for legacy UI and services
    @Transient
    private RegionType regionType = RegionType.MUNICIPALITY;

    @Transient
    private Integer activeAlertCount = 0;

    @Transient
    private Integer population = 50000;

    @Transient
    private String boundaryGeoJson;

    public GeographicalRegion() {}

    public GeographicalRegion(UUID regionId, String regionCode, String regionName, String state, String district,
                              MultiPolygon boundary, Point centroid, BigDecimal latitude, BigDecimal longitude,
                              String regionRiskLevel) {
        this.regionId = regionId;
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.state = state != null ? state : "Karnataka";
        this.district = district != null ? district : "Bangalore Urban";
        this.boundary = boundary;
        this.centroid = centroid;
        this.latitude = latitude;
        this.longitude = longitude;
        this.regionRiskLevel = regionRiskLevel != null ? regionRiskLevel : "LOW";
    }

    // Legacy constructor compatibility
    public GeographicalRegion(UUID id, String name, String regionCode, RegionType regionType,
                              Double centerLatitude, Double centerLongitude, String boundaryGeoJson,
                              RiskLevel currentRiskLevel, Integer activeAlertCount, Integer population,
                              Instant createdAt, Instant updatedAt) {
        this.regionId = id;
        this.regionName = name;
        this.regionCode = regionCode;
        this.regionType = regionType != null ? regionType : RegionType.MUNICIPALITY;
        if (centerLatitude != null) this.latitude = BigDecimal.valueOf(centerLatitude);
        if (centerLongitude != null) this.longitude = BigDecimal.valueOf(centerLongitude);
        this.boundaryGeoJson = boundaryGeoJson;
        this.regionRiskLevel = currentRiskLevel != null ? currentRiskLevel.name() : "LOW";
        this.activeAlertCount = activeAlertCount != null ? activeAlertCount : 0;
        this.population = population != null ? population : 0;
        this.state = "Karnataka";
        this.district = "Bengaluru Urban";
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
        if (updatedAt != null) this.updatedAt = updatedAt.atOffset(ZoneOffset.UTC);

        org.locationtech.jts.geom.GeometryFactory gf = new org.locationtech.jts.geom.GeometryFactory(new org.locationtech.jts.geom.PrecisionModel(), 4326);
        double lat = centerLatitude != null ? centerLatitude : 13.0827;
        double lon = centerLongitude != null ? centerLongitude : 80.2707;
        this.centroid = gf.createPoint(new org.locationtech.jts.geom.Coordinate(lon, lat));
        org.locationtech.jts.geom.Coordinate[] coords = new org.locationtech.jts.geom.Coordinate[] {
            new org.locationtech.jts.geom.Coordinate(lon - 0.05, lat - 0.05),
            new org.locationtech.jts.geom.Coordinate(lon + 0.05, lat - 0.05),
            new org.locationtech.jts.geom.Coordinate(lon + 0.05, lat + 0.05),
            new org.locationtech.jts.geom.Coordinate(lon - 0.05, lat + 0.05),
            new org.locationtech.jts.geom.Coordinate(lon - 0.05, lat - 0.05)
        };
        org.locationtech.jts.geom.Polygon poly = gf.createPolygon(coords);
        this.boundary = gf.createMultiPolygon(new org.locationtech.jts.geom.Polygon[]{poly});
    }

    public UUID getRegionId() { return regionId; }
    public void setRegionId(UUID regionId) { this.regionId = regionId; }

    public UUID getId() { return regionId; }
    public void setId(UUID id) { this.regionId = id; }

    public String getRegionCode() { return regionCode; }
    public void setRegionCode(String regionCode) { this.regionCode = regionCode; }

    public String getRegionName() { return regionName; }
    public void setRegionName(String regionName) { this.regionName = regionName; }

    public String getName() { return regionName; }
    public void setName(String name) { this.regionName = name; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getTaluk() { return taluk; }
    public void setTaluk(String taluk) { this.taluk = taluk; }

    public String getVillageOrLocality() { return villageOrLocality; }
    public void setVillageOrLocality(String villageOrLocality) { this.villageOrLocality = villageOrLocality; }

    public MultiPolygon getBoundary() { return boundary; }
    public void setBoundary(MultiPolygon boundary) { this.boundary = boundary; }

    public Point getCentroid() { return centroid; }
    public void setCentroid(Point centroid) { this.centroid = centroid; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public Double getCenterLatitude() {
        return latitude != null ? latitude.doubleValue() : null;
    }
    public void setCenterLatitude(Double centerLatitude) {
        if (centerLatitude != null) this.latitude = BigDecimal.valueOf(centerLatitude);
    }

    public Double getCenterLongitude() {
        return longitude != null ? longitude.doubleValue() : null;
    }
    public void setCenterLongitude(Double centerLongitude) {
        if (centerLongitude != null) this.longitude = BigDecimal.valueOf(centerLongitude);
    }

    public String getRegionRiskLevel() { return regionRiskLevel; }
    public void setRegionRiskLevel(String regionRiskLevel) { this.regionRiskLevel = regionRiskLevel; }

    public RiskLevel getCurrentRiskLevel() {
        try {
            return RiskLevel.valueOf(regionRiskLevel);
        } catch (Exception e) {
            return RiskLevel.LOW;
        }
    }
    public void setCurrentRiskLevel(RiskLevel currentRiskLevel) {
        this.regionRiskLevel = currentRiskLevel != null ? currentRiskLevel.name() : "LOW";
    }

    public BigDecimal getElevationMeters() { return elevationMeters; }
    public void setElevationMeters(BigDecimal elevationMeters) { this.elevationMeters = elevationMeters; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public RegionType getRegionType() { return regionType; }
    public void setRegionType(RegionType regionType) { this.regionType = regionType; }

    public Integer getActiveAlertCount() { return activeAlertCount; }
    public void setActiveAlertCount(Integer activeAlertCount) { this.activeAlertCount = activeAlertCount; }

    public Integer getPopulation() { return population; }
    public void setPopulation(Integer population) { this.population = population; }

    public String getBoundaryGeoJson() { return boundaryGeoJson; }
    public void setBoundaryGeoJson(String boundaryGeoJson) { this.boundaryGeoJson = boundaryGeoJson; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String name;
        private String regionCode;
        private RegionType regionType = RegionType.MUNICIPALITY;
        private Double centerLatitude;
        private Double centerLongitude;
        private String boundaryGeoJson;
        private RiskLevel currentRiskLevel = RiskLevel.LOW;
        private Integer activeAlertCount = 0;
        private Integer population = 0;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder regionCode(String regionCode) { this.regionCode = regionCode; return this; }
        public Builder regionType(RegionType regionType) { this.regionType = regionType; return this; }
        public Builder centerLatitude(Double centerLatitude) { this.centerLatitude = centerLatitude; return this; }
        public Builder centerLongitude(Double centerLongitude) { this.centerLongitude = centerLongitude; return this; }
        public Builder boundaryGeoJson(String boundaryGeoJson) { this.boundaryGeoJson = boundaryGeoJson; return this; }
        public Builder currentRiskLevel(RiskLevel currentRiskLevel) { this.currentRiskLevel = currentRiskLevel; return this; }
        public Builder activeAlertCount(Integer activeAlertCount) { this.activeAlertCount = activeAlertCount; return this; }
        public Builder population(Integer population) { this.population = population; return this; }

        public GeographicalRegion build() {
            return new GeographicalRegion(id, name, regionCode, regionType, centerLatitude, centerLongitude,
                    boundaryGeoJson, currentRiskLevel, activeAlertCount, population, Instant.now(), Instant.now());
        }
    }
}
