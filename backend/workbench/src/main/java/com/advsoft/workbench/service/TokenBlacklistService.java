package com.advsoft.workbench.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class TokenBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(TokenBlacklistService.class);
    private static final String KEY_PREFIX = "blacklist:";

    private final RedisTemplate<String, String> redisTemplate;

    public TokenBlacklistService(
            @Qualifier("rateLimitRedisTemplate")
            RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Blacklist a token for its remaining lifetime.
     */
    public void blacklist(String jti, Date tokenExpiry) {
        Duration remaining = Duration.between(Instant.now(), tokenExpiry.toInstant());

        if (remaining.isNegative() || remaining.isZero()) {
            // Token already expired, no need to blacklist
            return;
        }

        try {
            redisTemplate.opsForValue().set(KEY_PREFIX + jti, "1", remaining);
            log.debug("Blacklisted token jti: {}", jti);
        } catch (Exception e) {
            // Log but don't throw — logout should still succeed even if Redis is down
            log.error("Failed to blacklist token jti: {}", jti, e);
        }
    }

    public boolean isBlacklisted(String jti) {
        try {
            return redisTemplate.hasKey(KEY_PREFIX + jti);
        } catch (Exception e) {
            // Fail open — if Redis is down, don't block all requests
            // Acceptable tradeoff: briefly valid tokens post-logout during outage
            log.error("Failed to check blacklist for jti: {}", jti, e);
            return false;
        }
    }
}
