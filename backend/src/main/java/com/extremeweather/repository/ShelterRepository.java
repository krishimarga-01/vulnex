package com.extremeweather.repository;

import com.extremeweather.entity.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, UUID> {
    List<Shelter> findByDistrictIgnoreCase(String district);
    List<Shelter> findByStatus(String status);
}
