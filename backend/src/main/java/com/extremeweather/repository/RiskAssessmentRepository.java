package com.extremeweather.repository;

import com.extremeweather.entity.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, UUID> {

    @Query("SELECT r FROM RiskAssessment r WHERE r.vulnerablePerson.personId = :vulnerablePersonId ORDER BY r.assessedAt DESC")
    List<RiskAssessment> findByVulnerablePersonIdOrderByAssessedAtDesc(@Param("vulnerablePersonId") UUID vulnerablePersonId);

    @Query("SELECT r FROM RiskAssessment r WHERE r.vulnerablePerson.personId = :vulnerablePersonId ORDER BY r.assessedAt DESC LIMIT 1")
    Optional<RiskAssessment> findFirstByVulnerablePersonIdOrderByAssessedAtDesc(@Param("vulnerablePersonId") UUID vulnerablePersonId);
}
