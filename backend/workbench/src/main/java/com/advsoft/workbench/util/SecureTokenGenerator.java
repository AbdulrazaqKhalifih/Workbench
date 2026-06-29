package com.advsoft.workbench.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class SecureTokenGenerator {

    private final SecureRandom secureRandom = new SecureRandom();

    public String numericCode(int digits) {
        int bound = (int) Math.pow(10, digits);
        int code = secureRandom.nextInt(bound);
        return String.format("%0" + digits + "d", code);
    }

    public String generate(int bytes) {
        byte[] buffer = new byte[bytes];
        secureRandom.nextBytes(buffer);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer);
    }
}
