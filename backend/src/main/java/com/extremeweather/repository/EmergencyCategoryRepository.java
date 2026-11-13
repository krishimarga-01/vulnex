package com.extremeweather.repository;

import com.extremeweather.entity.EmergencyCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmergencyCategoryRepository extends JpaRepository<EmergencyCategoryEntity, UUID> {
    Optional<EmergencyCategoryEntity> findByCategoryCode(String categoryCode);
}
