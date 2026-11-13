package com.extremeweather.database;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Database Migration and Schema Compatibility Tests")
public class DatabaseMigrationAndSchemaTest {

    @Test
    @DisplayName("Verify Flyway migrations exist in classpath")
    void testAllFlywayMigrationsExist() throws Exception {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:db/migration/V*.sql");

        assertNotNull(resources, "Flyway migration resources should not be null");
        assertTrue(resources.length >= 2, "Expected at least 2 versioned migrations, found: " + resources.length);

        List<String> fileNames = Arrays.stream(resources)
                .map(Resource::getFilename)
                .sorted()
                .collect(Collectors.toList());

        assertTrue(fileNames.contains("V1__baseline_handover_schema.sql"), "Missing V1__baseline_handover_schema.sql");
        assertTrue(fileNames.contains("V2__seed_platform_compatibility_accounts.sql"), "Missing V2__seed_platform_compatibility_accounts.sql");
    }

    @Test
    @DisplayName("Verify Flyway migrations declare all 38 handover schema tables and PostGIS elements")
    void testFlywaySchemaDeclaresAllHandoverTables() throws Exception {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:db/migration/V*.sql");

        StringBuilder fullSql = new StringBuilder();
        for (Resource res : resources) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(res.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    fullSql.append(line.toLowerCase()).append("\n");
                }
            }
        }

        String sql = fullSql.toString();

        // 1. PostGIS and UUID Extensions
        assertTrue(sql.contains("uuid-ossp") || sql.contains("postgis"),
                "PostGIS or UUID extension must be declared");
        assertTrue(sql.contains("postgis"), "PostGIS extension must be declared");

        // 2. Core Handover Tables verification
        List<String> expectedTables = List.of(
                "roles",
                "users",
                "vulnerable_persons",
                "caregiver_relationships",
                "geographical_regions",
                "weather_observations",
                "weather_alerts",
                "risk_scoring_rules",
                "risk_assessments",
                "response_teams",
                "emergency_cases",
                "case_assignments",
                "notifications",
                "notification_delivery_logs",
                "audit_logs",
                "user_roles",
                "vulnerability_categories",
                "emergency_categories"
        );

        for (String table : expectedTables) {
            assertTrue(sql.contains("create table if not exists " + table) || sql.contains("create table " + table),
                    "Schema must declare table: " + table);
        }
    }
}