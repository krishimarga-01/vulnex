package com.extremeweather.repository;

import com.extremeweather.entity.CaregiverRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CaregiverRelationshipRepository extends JpaRepository<CaregiverRelationship, UUID> {

    @Query("SELECT c FROM CaregiverRelationship c WHERE c.caregiver.userId = :caregiverId")
    List<CaregiverRelationship> findByCaregiverId(@Param("caregiverId") UUID caregiverId);

    @Query("SELECT c FROM CaregiverRelationship c WHERE c.vulnerablePerson.personId = :vulnerablePersonId")
    List<CaregiverRelationship> findByVulnerablePersonId(@Param("vulnerablePersonId") UUID vulnerablePersonId);

    @Query("SELECT c FROM CaregiverRelationship c WHERE c.caregiver.userId = :caregiverId AND c.vulnerablePerson.personId = :vulnerablePersonId")
    Optional<CaregiverRelationship> findByCaregiverIdAndVulnerablePersonId(@Param("caregiverId") UUID caregiverId, @Param("vulnerablePersonId") UUID vulnerablePersonId);

    @Query("SELECT COUNT(c) > 0 FROM CaregiverRelationship c WHERE c.caregiver.userId = :caregiverId AND c.vulnerablePerson.personId = :vulnerablePersonId")
    boolean existsByCaregiverIdAndVulnerablePersonId(@Param("caregiverId") UUID caregiverId, @Param("vulnerablePersonId") UUID vulnerablePersonId);
}
