package com.extremeweather.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {

    private String username;
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    public AuthRequest() {}

    public AuthRequest(String username, String password) {
        this.username = username;
        this.usernameOrEmail = username;
        this.password = password;
    }

    public String getUsername() {
        if (username != null && !username.isBlank()) return username;
        return usernameOrEmail;
    }

    public void setUsername(String username) {
        this.username = username;
        if (this.usernameOrEmail == null) this.usernameOrEmail = username;
    }

    public String getUsernameOrEmail() {
        return getUsername();
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
        if (this.username == null) this.username = usernameOrEmail;
    }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String username;
        private String usernameOrEmail;
        private String password;

        public Builder username(String username) {
            this.username = username;
            return this;
        }
        public Builder usernameOrEmail(String usernameOrEmail) {
            this.usernameOrEmail = usernameOrEmail;
            return this;
        }
        public Builder password(String password) {
            this.password = password;
            return this;
        }
        public AuthRequest build() {
            AuthRequest req = new AuthRequest(username != null ? username : usernameOrEmail, password);
            req.setUsernameOrEmail(usernameOrEmail != null ? usernameOrEmail : username);
            return req;
        }
    }
}
