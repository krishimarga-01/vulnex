package com.extremeweather.repository;

import com.extremeweather.entity.ResponseTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResponseTeamRepository extends JpaRepository<ResponseTeam, UUID> {

    @Query("SELECT r FROM ResponseTeam r WHERE r.currentAvailability = 'AVAILABLE'")
    List<ResponseTeam> findByIsAvailableTrue();

    List<ResponseTeam> findByTeamType(String teamType);
}
