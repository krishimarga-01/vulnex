package com.extremeweather.security;

import com.extremeweather.entity.AccountStatus;
import com.extremeweather.entity.Role;
import com.extremeweather.entity.RoleEnum;
import com.extremeweather.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String username;
    private final String email;
    private final String password;
    private final String fullName;
    private final RoleEnum role;
    private final AccountStatus accountStatus;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String username, String email, String password, String fullName,
                         RoleEnum role, AccountStatus accountStatus, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.accountStatus = accountStatus != null ? accountStatus : AccountStatus.ACTIVE;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            for (Role role : user.getRoles()) {
                String rn = role.getRoleName();
                if (!rn.startsWith("ROLE_")) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + rn));
                }
                authorities.add(new SimpleGrantedAuthority(rn));
            }
        }
        if (authorities.isEmpty()) {
            authorities.add(new SimpleGrantedAuthority(user.getRole().name()));
        }

        AccountStatus status = AccountStatus.ACTIVE;
        if ("SUSPENDED".equalsIgnoreCase(user.getAccountStatus())) {
            status = AccountStatus.SUSPENDED;
        } else if ("PENDING".equalsIgnoreCase(user.getAccountStatus())) {
            status = AccountStatus.PENDING;
        }

        return builder()
                .id(user.getId())
                .username(user.getUsername() != null ? user.getUsername() : user.getEmail())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .fullName(user.getFullName())
                .role(user.getRole())
                .accountStatus(status)
                .authorities(authorities)
                .build();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private String username;
        private String email;
        private String password;
        private String fullName;
        private RoleEnum role;
        private AccountStatus accountStatus;
        private Collection<? extends GrantedAuthority> authorities;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(RoleEnum role) { this.role = role; return this; }
        public Builder accountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; return this; }
        public Builder authorities(Collection<? extends GrantedAuthority> authorities) { this.authorities = authorities; return this; }
        public UserPrincipal build() {
            return new UserPrincipal(id, username, email, password, fullName, role, accountStatus, authorities);
        }
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public RoleEnum getRole() { return role; }
    public AccountStatus getAccountStatus() { return accountStatus; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountStatus != AccountStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return accountStatus == AccountStatus.ACTIVE;
    }
}
