package com.extremeweather.repository;

import com.extremeweather.entity.RoleEnum;
import com.extremeweather.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:username) OR u.phoneNumber = :username OR LOWER(u.email) LIKE LOWER(CONCAT(:username, '@%'))")
    Optional<User> findByUsername(@Param("username") String username);

    Optional<User> findByEmailIgnoreCase(String email);

    default Optional<User> findByEmail(String email) {
        return findByEmailIgnoreCase(email);
    }

    Optional<User> findByPhoneNumber(String phoneNumber);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:username) OR u.phoneNumber = :username OR LOWER(u.email) LIKE LOWER(CONCAT(:username, '@%'))")
    boolean existsByUsername(@Param("username") String username);

    boolean existsByEmailIgnoreCase(String email);

    default boolean existsByEmail(String email) {
        return existsByEmailIgnoreCase(email);
    }

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleName = :roleName OR r.roleName = CONCAT('ROLE_', :roleName)")
    List<User> findByRoleName(@Param("roleName") String roleName);

    default List<User> findByRole(RoleEnum role) {
        if (role == null) return List.of();
        String name = role.name();
        if (name.startsWith("ROLE_")) {
            name = name.substring(5);
        }
        return findByRoleName(name);
    }
}
