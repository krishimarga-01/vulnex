# Java Spring Boot & Backend Integration Guide
## Extreme Weather Vulnerability Identification and Emergency Response System

This technical integration guide establishes the technical contract between the PostgreSQL 16 + PostGIS database and the Java 21 / Spring Boot 3.x backend.

---

### 1. Technology Compatibility Overview

| Component | Standard / Version | Hibernate & JPA Specification |
| :--- | :--- | :--- |
| **Java Runtime** | Java 21 (LTS) | Modern Records, Pattern Matching, Virtual Threads |
| **Framework** | Spring Boot 3.2+ | Spring Data JPA, Spring Security, Validation |
| **ORM Engine** | Hibernate 6.4+ | Direct support for `OffsetDateTime`, `@JdbcTypeCode(SqlTypes.JSON)`, Hibernate Spatial |
| **Spatial Engine**| PostGIS 3.4+ / JTS | `org.locationtech.jts.geom.Point`, `Polygon`, `MultiPolygon` |
| **Database Driver**| `org.postgresql:postgresql:42.7+` | Native UUID & JSONB support |
| **Migrations** | Flyway 10.x | Managed sequential migrations (`V1` to `V10`) |

---

### 2. Spring Boot `pom.xml` Dependencies

Ensure the following dependencies are included in your Spring Boot `pom.xml`:

```xml
<dependencies>
    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Hibernate Spatial for PostGIS -->
    <dependency>
        <groupId>org.hibernate.orm</groupId>
        <artifactId>hibernate-spatial</artifactId>
    </dependency>

    <!-- JTS Topology Suite for Geometry types -->
    <dependency>
        <groupId>org.locationtech.jts</groupId>
        <artifactId>jts-core</artifactId>
        <version>1.19.0</version>
    </dependency>

    <!-- Flyway Database Migrations -->
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-database-postgresql</artifactId>
    </dependency>

    <!-- Jackson for JSONB mapping -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

---

### 3. Application Configuration (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:extreme_weather_db}?reWriteBatchedInserts=true
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:CHANGE_ME}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 1800000
      connection-timeout: 20000

  jpa:
    database-platform: org.hibernate.spatial.dialect.postgis.PostgisPG95Dialect
    open-in-view: false
    show-sql: false
    properties:
      hibernate:
        format_sql: false
        jdbc:
          time_zone: UTC
          batch_size: 50
        order_inserts: true
        order_updates: true

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    validate-on-migrate: true
```

---

### 4. Data Type Mapping Reference

| PostgreSQL 16 Type | Java 21 / Hibernate 6 Type | Recommended Annotations |
| :--- | :--- | :--- |
| `UUID` | `java.util.UUID` | `@Id @GeneratedValue(strategy = GenerationType.UUID)` |
| `VARCHAR(n)` | `java.lang.String` | `@Column(name = "...", length = n, nullable = ...)` |
| `TEXT` | `java.lang.String` | `@Column(columnDefinition = "TEXT")` |
| `INT` / `INTEGER` | `java.lang.Integer` | `@Column(...)` |
| `BIGINT` | `java.lang.Long` | `@Column(...)` |
| `NUMERIC(p,s)` | `java.math.BigDecimal` | `@Column(precision = p, scale = s)` |
| `BOOLEAN` | `java.lang.Boolean` | `@Column(...)` |
| `DATE` | `java.time.LocalDate` | `@Column(...)` |
| `TIMESTAMPTZ` | `java.time.OffsetDateTime` / `Instant` | `@Column(name = "...", columnDefinition = "TIMESTAMPTZ")` |
| `JSONB` | `com.fasterxml.jackson.databind.JsonNode` or POJO | `@JdbcTypeCode(SqlTypes.JSON)` |
| `GEOMETRY(Point, 4326)` | `org.locationtech.jts.geom.Point` | `@Column(columnDefinition = "geometry(Point, 4326)")` |
| `GEOMETRY(Polygon, 4326)` | `org.locationtech.jts.geom.Polygon` | `@Column(columnDefinition = "geometry(Polygon, 4326)")` |
| `GEOMETRY(MultiPolygon, 4326)` | `org.locationtech.jts.geom.MultiPolygon` | `@Column(columnDefinition = "geometry(MultiPolygon, 4326)")` |

---

### 5. Production JPA Entity Examples

#### A. User Entity (`UserEntity.java`)
Demonstrates soft delete restriction, auditing timestamps, and role relations.

```java
package com.extremeweather.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@SQLRestriction("deleted_at IS NULL") // Hibernate 6 soft delete filtering
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", updatable = false, nullable = false)
    private UUID userId;

    @NotNull
    @Column(name = "full_name", length = 150, nullable = false)
    private String fullName;

    @NotNull
    @Email
    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @NotNull
    @Column(name = "phone_number", length = 20, nullable = false, unique = true)
    private String phoneNumber;

    @NotNull
    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @NotNull
    @Column(name = "account_status", length = 30, nullable = false)
    private String accountStatus = "ACTIVE";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleEntity> roles = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    // Getters, Setters, Constructors
}
```

#### B. Vulnerable Person Entity (`VulnerablePersonEntity.java`)
Demonstrates PostGIS JTS Point integration, BigDecimal coordinates, and category relationships.

```java
package com.extremeweather.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vulnerable_persons")
@SQLRestriction("deleted_at IS NULL AND is_active = TRUE")
public class VulnerablePersonEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "person_id", updatable = false, nullable = false)
    private UUID personId;

    @NotNull
    @Column(name = "full_name", length = 150, nullable = false)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "age")
    private Integer age;

    @NotNull
    @Column(name = "age_category", length = 30, nullable = false)
    private String ageCategory; // INFANT, CHILD, ADULT, SENIOR_CITIZEN

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "primary_phone", length = 20)
    private String primaryPhone;

    @Column(name = "address_line", columnDefinition = "TEXT")
    private String addressLine;

    @Column(name = "district", length = 100, nullable = false)
    private String district;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_category_id", nullable = false)
    private VulnerabilityCategoryEntity primaryCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "geographical_region_id")
    private GeographicalRegionEntity geographicalRegion;

    /**
     * PostGIS Point representation (SRID 4326: WGS 84 GPS).
     * JTS coordinates use (X = Longitude, Y = Latitude).
     */
    @Column(name = "location", columnDefinition = "geometry(Point, 4326)")
    private Point location;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @NotNull
    @Column(name = "verification_status", length = 30, nullable = false)
    private String verificationStatus = "UNVERIFIED";

    @NotNull
    @Column(name = "consent_status", length = 30, nullable = false)
    private String consentStatus = "GIVEN";

    @Column(name = "medical_notes_encrypted", columnDefinition = "TEXT")
    private String medicalNotesEncrypted;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    // Getters, Setters, Constructors
}
```

#### C. Emergency Case Entity (`EmergencyCaseEntity.java`)
Demonstrates ticket tracking, incident spatial coordinate, and status management.

```java
package com.extremeweather.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "emergency_cases")
public class EmergencyCaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "case_id", updatable = false, nullable = false)
    private UUID caseId;

    @NotNull
    @Column(name = "case_number", length = 30, nullable = false, unique = true)
    private String caseNumber; // EMG-YYYY-XXXX

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private UserEntity reporter;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "affected_person_id", nullable = false)
    private VulnerablePersonEntity affectedPerson;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private EmergencyCategoryEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weather_alert_id")
    private WeatherAlertEntity weatherAlert;

    @NotNull
    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotNull
    @Column(name = "location", columnDefinition = "geometry(Point, 4326)", nullable = false)
    private Point location;

    @NotNull
    @Column(name = "latitude", precision = 10, scale = 8, nullable = false)
    private BigDecimal latitude;

    @NotNull
    @Column(name = "longitude", precision = 11, scale = 8, nullable = false)
    private BigDecimal longitude;

    @NotNull
    @Column(name = "priority", length = 20, nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @NotNull
    @Column(name = "current_status", length = 30, nullable = false)
    private String currentStatus = "REPORTED"; // REPORTED, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_team_id")
    private ResponseTeamEntity assignedTeam;

    @Column(name = "resolution_details", columnDefinition = "TEXT")
    private String resolutionDetails;

    @CreationTimestamp
    @Column(name = "reported_at", nullable = false, updatable = false)
    private OffsetDateTime reportedAt;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @Column(name = "assigned_at")
    private OffsetDateTime assignedAt;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Getters, Setters, Constructors
}
```

#### D. Risk Scoring Rule Entity with JSONB (`RiskScoringRuleEntity.java`)
Demonstrates mapping PostgreSQL `JSONB` parameters using Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)`.

```java
package com.extremeweather.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "risk_scoring_rules")
public class RiskScoringRuleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rule_id", updatable = false, nullable = false)
    private UUID ruleId;

    @NotNull
    @Column(name = "rule_version", length = 30, nullable = false, unique = true)
    private String ruleVersion;

    @NotNull
    @Column(name = "rule_name", length = 150, nullable = false)
    private String ruleName;

    /**
     * PostgreSQL JSONB column mapped directly to Jackson JsonNode
     */
    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parameters", columnDefinition = "jsonb", nullable = false)
    private JsonNode parameters;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Getters, Setters, Constructors
}
```

---

### 6. Spring Data JPA Repositories with PostGIS Spatial Queries

```java
package com.extremeweather.repository;

import com.extremeweather.entity.EmergencyCaseEntity;
import com.extremeweather.entity.ShelterEntity;
import com.extremeweather.entity.VulnerablePersonEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmergencyCaseRepository extends JpaRepository<EmergencyCaseEntity, UUID> {

    @Query("""
        SELECT ec FROM EmergencyCaseEntity ec
        WHERE ec.currentStatus IN ('REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS')
        ORDER BY 
            CASE ec.priority
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MEDIUM' THEN 3
                ELSE 4
            END,
            ec.reportedAt ASC
    """)
    Page<EmergencyCaseEntity> findPendingCases(Pageable pageable);

    @Query(value = """
        SELECT ec.* FROM emergency_cases ec
        WHERE ec.assigned_team_id = :teamId
          AND ec.current_status IN ('ASSIGNED', 'IN_PROGRESS')
        ORDER BY ec.reported_at ASC
    """, nativeQuery = true)
    List<EmergencyCaseEntity> findActiveCasesForTeam(@Param("teamId") UUID teamId);
}
```

#### Spatial Nearby Shelters Repository (`ShelterRepository.java`):

```java
package com.extremeweather.repository;

import com.extremeweather.entity.ShelterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShelterRepository extends JpaRepository<ShelterEntity, UUID> {

    /**
     * Finds active shelters within a specified radius (in meters) of a coordinate.
     * PostGIS ST_DWithin on geometry::geography performs geodesic calculation.
     */
    @Query(value = """
        SELECT s.* FROM shelters s
        JOIN shelter_capacity sc ON sc.shelter_id = s.shelter_id
        WHERE s.status = 'ACTIVE'
          AND sc.available_capacity > 0
          AND ST_DWithin(
                s.location::geography,
                ST_SetSRID(ST_Point(:longitude, :latitude), 4326)::geography,
                :radiusMeters
          )
        ORDER BY ST_Distance(
            s.location::geography,
            ST_SetSRID(ST_Point(:longitude, :latitude), 4326)::geography
        ) ASC
    """, nativeQuery = true)
    List<ShelterEntity> findNearbySheltersWithCapacity(
        @Param("longitude") double longitude,
        @Param("latitude") double latitude,
        @Param("radiusMeters") double radiusMeters
    );
}
```

---

### 7. Shared Database Contract Principles

1. **Immutable Column / Table Names**: Table and column names must never be renamed. Additions or deprecations must be handled exclusively through new Flyway migrations (`V11__...`).
2. **Coordinate Representation**: Frontends sending coordinates to the backend must always submit standard WGS 84 GPS decimal degrees:
   - Latitude: between `-90.0` and `+90.0`
   - Longitude: between `-180.0` and `+180.0`
   - JTS PostGIS Point convention: `geometryFactory.createPoint(new Coordinate(longitude, latitude))` (Note X = Lon, Y = Lat).
3. **No Database Calculation Triggers**: Risk scoring logic is strictly implemented inside Java backend services; the database stores the versioned rules, inputs, and results.
4. **Soft-Delete Safety Guarantee**: Deleting a user or vulnerable person flags `deleted_at = CURRENT_TIMESTAMP`. Emergency cases and audit logs retain references safely.
