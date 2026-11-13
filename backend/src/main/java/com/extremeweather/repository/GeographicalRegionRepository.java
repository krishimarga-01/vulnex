package com.extremeweather.repository;

import com.extremeweather.entity.GeographicalRegion;
import com.extremeweather.entity.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GeographicalRegionRepository extends JpaRepository<GeographicalRegion, UUID> {
    Optional<GeographicalRegion> findByRegionCode(String regionCode);

    @Query("SELECT r FROM GeographicalRegion r WHERE r.regionRiskLevel = :#{#riskLevel.name()}")
    List<GeographicalRegion> findByCurrentRiskLevel(@Param("riskLevel") RiskLevel riskLevel);
}
