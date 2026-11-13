package com.extremeweather.repository;

import com.extremeweather.entity.WeatherObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeatherObservationRepository extends JpaRepository<WeatherObservation, UUID> {

    @Query("SELECT w FROM WeatherObservation w WHERE w.region.regionId = :regionId ORDER BY w.observationTimestamp DESC")
    List<WeatherObservation> findByRegionIdOrderByObservedAtDesc(@Param("regionId") UUID regionId);

    @Query("SELECT w FROM WeatherObservation w WHERE w.region.regionId = :regionId ORDER BY w.observationTimestamp DESC LIMIT 1")
    Optional<WeatherObservation> findLatestByRegionId(@Param("regionId") UUID regionId);

    @Query("SELECT w FROM WeatherObservation w ORDER BY w.observationTimestamp DESC LIMIT 10")
    List<WeatherObservation> findTop10ByOrderByObservedAtDesc();
}
