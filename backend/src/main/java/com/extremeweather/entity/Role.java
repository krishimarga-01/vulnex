package com.extremeweather.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "role_id", updatable = false, nullable = false)
    private UUID roleId;

    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private String roleName;

    @Column(length = 255)
    private String description;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public Role() {}

    public Role(UUID roleId, String roleName, String description) {
        this.roleId = roleId;
        this.roleName = roleName;
        this.description = description;
    }

    public UUID getRoleId() { return roleId; }
    public void setRoleId(UUID roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    // Compatibility accessors for existing services
    public UUID getId() { return roleId; }
    public void setId(UUID id) { this.roleId = id; }
    public String getName() { return roleName; }
    public void setName(String name) { this.roleName = name; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID roleId;
        private String roleName;
        private String description;

        public Builder id(UUID id) { this.roleId = id; return this; }
        public Builder roleId(UUID roleId) { this.roleId = roleId; return this; }
        public Builder name(String name) { this.roleName = name; return this; }
        public Builder roleName(String roleName) { this.roleName = roleName; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Role build() { return new Role(roleId, roleName, description); }
    }
}
