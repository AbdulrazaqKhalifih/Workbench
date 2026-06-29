package com.advsoft.workbench.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class SecurityContextHelper {

    /**
     * Get the current authenticated user's ID
     *
     * @return Long of authenticated user
     * @throws IllegalStateException if no authentication or principal is not Long
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Long) {
            return ( Long) principal;
        }

        throw new IllegalStateException("Principal is not a Long: " + principal.getClass());
    }

    /**
     * Get the current authenticated user's ID or null if not authenticated
     *
     * @return Long of authenticated user or null
     */
    public static Long getCurrentUserIdOrNull() {
        try {
            return getCurrentUserId();
        } catch (IllegalStateException e) {
            return null;
        }
    }

    /**
     * Get the current authenticated user's roles
     *
     * @return List of role names (e.g., ["ROLE_USER", "ROLE_ADMIN"])
     */
    public static Collection<String> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Collections.emptyList();
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }

    /**
     * Check if current user has a specific role
     *
     * @param role Role name (e.g., "ROLE_ADMIN")
     * @return true if user has the role
     */
    public static boolean hasRole(String role) {
        return getCurrentUserRoles().contains(role);
    }

    /**
     * Check if current user has any of the specified roles
     *
     * @param roles Role names to check
     * @return true if user has any of the roles
     */
    public static boolean hasAnyRole(String... roles) {
        Collection<String> userRoles = getCurrentUserRoles();
        for (String role : roles) {
            if (userRoles.contains(role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if current user has all of the specified roles
     *
     * @param roles Role names to check
     * @return true if user has all of the roles
     */
    public static boolean hasAllRoles(String... roles) {
        Collection<String> userRoles = getCurrentUserRoles();
        for (String role : roles) {
            if (!userRoles.contains(role)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get the current Authentication object
     *
     * @return Authentication object or null
     */
    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Check if user is authenticated
     *
     * @return true if user is authenticated
     */
    public static boolean isAuthenticated() {
        Authentication authentication = getAuthentication();
        return authentication != null &&
                authentication.isAuthenticated() &&
                !(authentication.getPrincipal() instanceof String &&
                        "anonymousUser".equals(authentication.getPrincipal()));
    }
}
