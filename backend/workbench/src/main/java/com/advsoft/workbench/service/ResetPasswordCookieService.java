package com.advsoft.workbench.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class ResetPasswordCookieService {

    public static final String COOKIE_NAME = "wb_reset_session";
    private static final Duration TTL = Duration.ofMinutes(15);

    /**
     * In prod this should be true (HTTPS). In local HTTP dev, set to false:
     * app.cookies.secure=false
     */
    @Value("${identity.app.cookies.secure:true}")
    private boolean secure;

    // Must match controller prefix: /api/v1/auth/password/reset/*
    private static final String COOKIE_PATH = "/api/v1/auth/password/reset";

    public ResponseCookie create(String rawToken) {
        return ResponseCookie.from(COOKIE_NAME, rawToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path(COOKIE_PATH)
                .maxAge(TTL)
                .build();
    }

    public ResponseCookie clear() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path(COOKIE_PATH)
                .maxAge(0)
                .build();
    }
}
