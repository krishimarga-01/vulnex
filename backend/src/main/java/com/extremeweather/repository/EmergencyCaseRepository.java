package com.extremeweather.repository;

import com.extremeweather.entity.CaseStatus;
import com.extremeweather.entity.EmergencyCase;
import com.extremeweather.entity.EmergencyPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmergencyCaseRepository extends JpaRepository<EmergencyCase, UUID> {

    Optional<EmergencyCase> findByCaseNumber(String caseNumber);

    @Query("SELECT c FROM EmergencyCase c WHERE c.reporter.userId = :reporterId ORDER BY c.createdAt DESC")
    List<EmergencyCase> findByReporterIdOrderByCreatedAtDesc(@Param("reporterId") UUID reporterId);

    @Query("SELECT c FROM EmergencyCase c WHERE c.currentStatus = :#{#status.name()}")
    List<EmergencyCase> findByStatus(@Param("status") CaseStatus status);

    @Query("SELECT c FROM EmergencyCase c WHERE c.priority = :#{#priority.name()}")
    List<EmergencyCase> findByPriority(@Param("priority") EmergencyPriority priority);

    @Query("SELECT COUNT(c) FROM EmergencyCase c WHERE c.currentStatus = :#{#status.name()}")
    long countByStatus(@Param("status") CaseStatus status);

    @Query("SELECT c FROM EmergencyCase c WHERE " +
           "(:status IS NULL OR c.currentStatus = :#{#status != null ? #status.name() : null}) AND " +
           "(:priority IS NULL OR c.priority = :#{#priority != null ? #priority.name() : null}) AND " +
           "(CAST(:searchTerm AS string) IS NULL OR " +
           " LOWER(c.caseNumber) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')) " +
           " OR LOWER(c.description) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')) " +
           " OR LOWER(c.addressDetails) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')))")
    Page<EmergencyCase> searchCases(
            @Param("status") CaseStatus status,
            @Param("priority") EmergencyPriority priority,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    List<EmergencyCase> findTop10ByOrderByCreatedAtDesc();
}
