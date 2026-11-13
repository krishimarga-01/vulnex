package com.extremeweather.dto;

import com.extremeweather.entity.AccountStatus;
import com.extremeweather.entity.RoleEnum;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public class UserProfileResponse {

    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private RoleEnum role;
    private AccountStatus accountStatus;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String fcmToken;
    private Instant createdAt;

    public UserProfileResponse() {}

    public UserProfileResponse(UUID id, String username, String email, String fullName, String phoneNumber, RoleEnum role, AccountStatus accountStatus, String emergencyContactName, String emergencyContactPhone, String fcmToken, Instant createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.accountStatus = accountStatus;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.fcmToken = fcmToken;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public RoleEnum getRole() { return role; }
    public void setRole(RoleEnum role) { this.role = role; }

    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String username;
        private String email;
        private String fullName;
        private String phoneNumber;
        private RoleEnum role;
        private AccountStatus accountStatus;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String fcmToken;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder role(RoleEnum role) { this.role = role; return this; }
        public Builder accountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; return this; }
        public Builder accountStatus(String accountStatus) {
            try {
                this.accountStatus = AccountStatus.valueOf(accountStatus);
            } catch (Exception e) {
                this.accountStatus = AccountStatus.ACTIVE;
            }
            return this;
        }
        public Builder emergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; return this; }
        public Builder emergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; return this; }
        public Builder fcmToken(String fcmToken) { this.fcmToken = fcmToken; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder createdAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt != null ? createdAt.toInstant() : null;
            return this;
        }

        public UserProfileResponse build() {
            return new UserProfileResponse(id, username, email, fullName, phoneNumber, role, accountStatus, emergencyContactName, emergencyContactPhone, fcmToken, createdAt);
        }
    }
}
