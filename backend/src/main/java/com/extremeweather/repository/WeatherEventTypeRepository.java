package com.extremeweather.repository;

import com.extremeweather.entity.WeatherEventTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeatherEventTypeRepository extends JpaRepository<WeatherEventTypeEntity, UUID> {
    Optional<WeatherEventTypeEntity> findByEventCode(String eventCode);
}
