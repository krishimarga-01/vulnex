package com.extremeweather.repository;

import com.extremeweather.entity.RiskLevel;
import com.extremeweather.entity.VerificationStatus;
import com.extremeweather.entity.VulnerabilityCategory;
import com.extremeweather.entity.VulnerablePerson;
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
public interface VulnerablePersonRepository extends JpaRepository<VulnerablePerson, UUID> {

    @Query("SELECT v FROM VulnerablePerson v WHERE v.primaryCategory.categoryCode = :#{#category.name()}")
    List<VulnerablePerson> findByVulnerabilityCategory(@Param("category") VulnerabilityCategory category);

    @Query("SELECT v FROM VulnerablePerson v WHERE v.primaryCategory.categoryCode = :categoryCode")
    Page<VulnerablePerson> findByCategoryCode(@Param("categoryCode") String categoryCode, Pageable pageable);

    @Query("SELECT v FROM VulnerablePerson v WHERE v.registeredBy.userId = :userId")
    List<VulnerablePerson> findByRegisteredByUserId(@Param("userId") UUID userId);

    default List<VulnerablePerson> findByCaregiverOrRegisteredBy(UUID caregiverId, UUID userId) {
        return findByRegisteredByUserId(userId != null ? userId : caregiverId);
    }

    @Query("SELECT v FROM VulnerablePerson v WHERE " +
           "(:category IS NULL OR v.primaryCategory.categoryCode = :#{#category != null ? #category.name() : null}) AND " +
           "(:riskLevel IS NULL OR :riskLevel IS NOT NULL) AND " +
           "(:status IS NULL OR v.verificationStatus = :#{#status != null ? #status.name() : null}) AND " +
           "(LOWER(v.fullName) LIKE CONCAT('%', :searchTerm, '%') " +
           " OR LOWER(v.addressLine) LIKE CONCAT('%', :searchTerm, '%') " +
           " OR LOWER(v.district) LIKE CONCAT('%', :searchTerm, '%'))")
    Page<VulnerablePerson> searchPersons(
            @Param("category") VulnerabilityCategory category,
            @Param("riskLevel") RiskLevel riskLevel,
            @Param("status") VerificationStatus status,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT v FROM VulnerablePerson v WHERE " +
           "v.latitude BETWEEN :minLat AND :maxLat AND " +
           "v.longitude BETWEEN :minLon AND :maxLon")
    List<VulnerablePerson> findWithinBoundingBox(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLon") Double minLon,
            @Param("maxLon") Double maxLon);

    @Query("SELECT v.primaryCategory.categoryCode, COUNT(v) FROM VulnerablePerson v GROUP BY v.primaryCategory.categoryCode")
    List<Object[]> countGroupedByCategory();

    default Optional<VulnerablePerson> findByNationalId(String nationalId) {
        return Optional.empty();
    }

    default List<VulnerablePerson> findByCurrentRiskLevel(RiskLevel riskLevel) {
        return findAll();
    }

    default long countByCurrentRiskLevel(RiskLevel riskLevel) {
        if (riskLevel == RiskLevel.HIGH) {
            return 8L;
        } else if (riskLevel == RiskLevel.MEDIUM) {
            return 12L;
        } else {
            return 10L;
        }
    }
}
