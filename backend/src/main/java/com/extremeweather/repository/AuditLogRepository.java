package com.extremeweather.repository;

import com.extremeweather.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC LIMIT 20")
    List<AuditLog> findTop20ByOrderByCreatedAtDesc();

    @Query("SELECT a FROM AuditLog a WHERE a.user.userId = :userId ORDER BY a.timestamp DESC")
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
}
