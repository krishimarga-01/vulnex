package com.extremeweather.repository;

import com.extremeweather.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    @Query("SELECT r FROM Role r WHERE r.roleName = :roleName OR r.roleName = CONCAT('ROLE_', :roleName) OR CONCAT('ROLE_', r.roleName) = :roleName")
    java.util.List<Role> findAllMatchingRoles(@Param("roleName") String roleName);

    default Optional<Role> findByRoleName(String roleName) {
        if (roleName == null) return Optional.empty();
        java.util.List<Role> list = findAllMatchingRoles(roleName);
        if (list.isEmpty()) return Optional.empty();
        return list.stream()
                .filter(r -> roleName.equalsIgnoreCase(r.getRoleName()))
                .findFirst()
                .or(() -> Optional.of(list.get(0)));
    }

    default Optional<Role> findByName(String name) {
        return findByRoleName(name);
    }
}
