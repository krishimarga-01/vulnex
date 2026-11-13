package com.extremeweather.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@SQLRestriction("deleted_at IS NULL")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", updatable = false, nullable = false)
    private UUID userId;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "account_status", nullable = false, length = 30)
    private String accountStatus = "ACTIVE";

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    // Transient compatibility fields for legacy controllers/services/notifications
    @Transient
    private String emergencyContactName;

    @Transient
    private String emergencyContactPhone;

    @Transient
    private String fcmToken;

    public User() {}

    public User(UUID userId, String fullName, String email, String phoneNumber,
                String passwordHash, String accountStatus) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.passwordHash = passwordHash;
        this.accountStatus = accountStatus != null ? accountStatus : "ACTIVE";
    }

    // Legacy constructor compatibility for test and initializers
    public User(UUID userId, String username, String email, String passwordHash,
                String fullName, String phoneNumber, RoleEnum role, AccountStatus status,
                String emergencyContactName, String emergencyContactPhone, String fcmToken,
                Instant createdAt, Instant updatedAt) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.passwordHash = passwordHash;
        this.accountStatus = status != null ? status.name() : "ACTIVE";
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.fcmToken = fcmToken;
        if (createdAt != null) this.createdAt = createdAt.atOffset(ZoneOffset.UTC);
        if (updatedAt != null) this.updatedAt = updatedAt.atOffset(ZoneOffset.UTC);
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public OffsetDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }

    // Compatibility accessors for existing Spring Security, DTO, and Service layers
    public UUID getId() { return userId; }
    public void setId(UUID id) { this.userId = id; }

    public String getUsername() {
        return email != null ? email : (phoneNumber != null ? phoneNumber : (userId != null ? userId.toString() : ""));
    }

    public void setUsername(String username) {
        if (this.email == null && username != null && username.contains("@")) {
            this.email = username;
        }
    }

    public RoleEnum getRole() {
        if (roles == null || roles.isEmpty()) {
            return RoleEnum.ROLE_CITIZEN;
        }
        for (Role r : roles) {
            String rn = r.getRoleName();
            if ("ADMIN".equalsIgnoreCase(rn) || "ROLE_ADMIN".equalsIgnoreCase(rn)) return RoleEnum.ROLE_ADMIN;
            if ("AUTHORITY".equalsIgnoreCase(rn) || "ROLE_AUTHORITY".equalsIgnoreCase(rn)) return RoleEnum.ROLE_AUTHORITY;
            if ("CAREGIVER".equalsIgnoreCase(rn) || "ROLE_CAREGIVER".equalsIgnoreCase(rn)) return RoleEnum.ROLE_CAREGIVER;
            if ("VOLUNTEER".equalsIgnoreCase(rn) || "ROLE_VOLUNTEER".equalsIgnoreCase(rn)) return RoleEnum.ROLE_VOLUNTEER;
            if ("CITIZEN".equalsIgnoreCase(rn) || "ROLE_CITIZEN".equalsIgnoreCase(rn)) return RoleEnum.ROLE_CITIZEN;
        }
        return RoleEnum.ROLE_CITIZEN;
    }

    public void setRole(RoleEnum roleEnum) {
        // Handled via user_roles in service
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID userId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String passwordHash;
        private String accountStatus = "ACTIVE";
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String fcmToken;
        private Set<Role> roles = new HashSet<>();

        public Builder id(UUID id) { this.userId = id; return this; }
        public Builder userId(UUID userId) { this.userId = userId; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder username(String username) {
            if (this.email == null && username != null && username.contains("@")) {
                this.email = username;
            }
            return this;
        }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder accountStatus(String accountStatus) { this.accountStatus = accountStatus; return this; }
        public Builder accountStatus(AccountStatus status) {
            this.accountStatus = status != null ? status.name() : "ACTIVE";
            return this;
        }
        public Builder emergencyContactName(String name) { this.emergencyContactName = name; return this; }
        public Builder emergencyContactPhone(String phone) { this.emergencyContactPhone = phone; return this; }
        public Builder fcmToken(String token) { this.fcmToken = token; return this; }
        public Builder role(RoleEnum role) {
            if (role != null) {
                if (this.roles == null) {
                    this.roles = new java.util.HashSet<>();
                }
                String name = role.name();
                if (name.startsWith("ROLE_")) {
                    name = name.substring(5);
                }
                this.roles.add(new Role(UUID.randomUUID(), name, name + " role"));
            }
            return this;
        }
        public Builder roles(Set<Role> roles) { this.roles = roles; return this; }

        public User build() {
            User u = new User(userId, fullName, email, phoneNumber, passwordHash, accountStatus);
            u.setRoles(roles);
            u.setEmergencyContactName(emergencyContactName);
            u.setEmergencyContactPhone(emergencyContactPhone);
            u.setFcmToken(fcmToken);
            return u;
        }
    }
}
