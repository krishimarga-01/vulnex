package com.extremeweather.repository;

import com.extremeweather.entity.WeatherAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeatherAlertRepository extends JpaRepository<WeatherAlert, UUID> {

    Optional<WeatherAlert> findByExternalSourceId(String externalSourceId);

    default Optional<WeatherAlert> findByAlertCode(String alertCode) {
        return findByExternalSourceId(alertCode);
    }

    @Query("SELECT a FROM WeatherAlert a WHERE a.alertStatus = 'ACTIVE'")
    List<WeatherAlert> findByIsActiveTrue();

    @Query("SELECT a FROM WeatherAlert a WHERE a.alertStatus = 'ACTIVE' ORDER BY a.createdAt DESC")
    List<WeatherAlert> findByIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT a FROM WeatherAlert a WHERE a.alertStatus = 'ACTIVE' AND a.startTime <= :now AND a.expirationTime >= :now")
    List<WeatherAlert> findCurrentlyEffectiveAlertsOffset(@Param("now") OffsetDateTime now);

    default List<WeatherAlert> findCurrentlyEffectiveAlerts(Instant now) {
        OffsetDateTime odt = now != null ? now.atOffset(ZoneOffset.UTC) : OffsetDateTime.now();
        return findCurrentlyEffectiveAlertsOffset(odt);
    }

    @Query("SELECT COUNT(a) FROM WeatherAlert a WHERE a.alertStatus = 'ACTIVE'")
    long countByIsActiveTrue();
}
