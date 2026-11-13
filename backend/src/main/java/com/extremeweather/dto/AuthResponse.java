package com.extremeweather.dto;

import com.extremeweather.entity.RoleEnum;
import java.util.UUID;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long expiresInMs;
    private Long expiresInSeconds;
    private UUID userId;
    private String username;
    private String email;
    private String fullName;
    private RoleEnum role;

    public AuthResponse() {}

    public AuthResponse(String token, String tokenType, Long expiresInMs, UUID userId, String username, String email, String fullName, RoleEnum role) {
        this.token = token;
        this.tokenType = tokenType;
        this.expiresInMs = expiresInMs;
        this.expiresInSeconds = expiresInMs != null ? expiresInMs / 1000 : 86400L;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getExpiresInMs() { return expiresInMs; }
    public void setExpiresInMs(Long expiresInMs) {
        this.expiresInMs = expiresInMs;
        if (expiresInMs != null) this.expiresInSeconds = expiresInMs / 1000;
    }

    public Long getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(Long expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public RoleEnum getRole() { return role; }
    public void setRole(RoleEnum role) { this.role = role; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private String tokenType = "Bearer";
        private Long expiresInMs;
        private UUID userId;
        private String username;
        private String email;
        private String fullName;
        private RoleEnum role;

        public Builder token(String token) { this.token = token; return this; }
        public Builder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public Builder expiresInMs(Long expiresInMs) { this.expiresInMs = expiresInMs; return this; }
        public Builder userId(UUID userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(RoleEnum role) { this.role = role; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, tokenType, expiresInMs, userId, username, email, fullName, role);
        }
    }
}
