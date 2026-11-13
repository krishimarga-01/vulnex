package com.extremeweather.security;

import com.extremeweather.entity.RoleEnum;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    public static UUID getCurrentUserId() {
        UserPrincipal principal = getCurrentUser();
        return principal != null ? principal.getId() : null;
    }

    public static String getCurrentUsername() {
        UserPrincipal principal = getCurrentUser();
        return principal != null ? principal.getUsername() : "ANONYMOUS";
    }

    public static boolean isAuthorityOrAdmin() {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) return false;
        return principal.getRole() == RoleEnum.ROLE_AUTHORITY || principal.getRole() == RoleEnum.ROLE_ADMIN;
    }
}
