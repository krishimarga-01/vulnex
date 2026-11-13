package com.extremeweather.repository;

import com.extremeweather.entity.CaseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CaseAssignmentRepository extends JpaRepository<CaseAssignment, UUID> {

    @Query("SELECT c FROM CaseAssignment c WHERE c.emergencyCase.caseId = :emergencyCaseId ORDER BY c.assignedAt DESC")
    List<CaseAssignment> findByEmergencyCaseIdOrderByAssignedAtDesc(@Param("emergencyCaseId") UUID emergencyCaseId);

    @Query("SELECT c FROM CaseAssignment c WHERE c.responseTeam.teamId = :responseTeamId")
    List<CaseAssignment> findByResponseTeamId(@Param("responseTeamId") UUID responseTeamId);
}
