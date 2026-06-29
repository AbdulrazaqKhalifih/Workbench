package com.advsoft.workbench.filter;

import com.advsoft.workbench.service.JwtService;
import com.advsoft.workbench.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            // Extract JWT from request
            String jwt = extractJwtFromRequest(request);

            // If JWT exists and is valid, set authentication
            if (jwt != null && jwtService.validateToken(jwt)) {
                String jti = jwtService.extractJti(jwt);
                if (tokenBlacklistService.isBlacklisted(jti)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                }else{
                    authenticateUser(jwt, request);
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
            // Don't throw exception - let the request continue
            // Spring Security will handle unauthorized access
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String extractJwtFromRequest(HttpServletRequest request) {

        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        return null;
    }

    /**
     * Authenticate user by setting SecurityContext
     */
    private void authenticateUser(String jwt, HttpServletRequest request) {
        // Extract userId and roles from JWT
        Long userId = jwtService.extractUserId(jwt);
        List<String> roles = jwtService.extractRoles(jwt);

        // Convert roles to Spring Security authorities
        List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        // Create authentication token
        // Principal = userId (Long), Credentials = null (stateless), Authorities = roles
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        authorities
                );

        // Set additional details
        authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
        );

        // Set authentication in SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.debug("Set authentication for user: {} with roles: {}", userId, roles);
    }
}