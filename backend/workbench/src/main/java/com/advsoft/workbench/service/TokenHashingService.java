package com.advsoft.workbench.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class TokenHashingService {

    @Value("${identity.app.security.token.pepper}")
    private String pepper;

    public String sha256Base64(String rawToken) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(
                    (pepper + ":" + rawToken).getBytes(StandardCharsets.UTF_8)
            );
            return Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to hash token", e);
        }
    }

    public boolean matches(String raw, String expectedHash) {
        return sha256Base64(raw).equals(expectedHash);
    }
}
