package com.advsoft.workbench.service;

import com.advsoft.workbench.config.RateLimitConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.data.redis.core.types.Expiration;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);
    private static final String KEY_PREFIX = "ratelimit:";
    private static final String INCR_AND_EXPIRE_SCRIPT = """
    local count = redis.call('INCR', KEYS[1])
    if count == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return count
    """;

    private final RedisTemplate<String, String> redisTemplate;
    private final RateLimitConfig config;

    // IMPORTANT: this must be the String-based template (rateLimitRedisTemplate)
    public RateLimiterService(
            @Qualifier("rateLimitRedisTemplate")
            ObjectProvider<RedisTemplate<String, String>> rateLimitRedisTemplate,
            RateLimitConfig config) {
        this.redisTemplate = rateLimitRedisTemplate.getIfAvailable();
        this.config = config;
    }

    /**
     * Convenience overload using global defaults.
     */
    public boolean isAllowed(String key) {
        return isAllowed(
                key,
                config.getGlobal().getDefaultMaxAttempts(),
                Duration.ofSeconds(config.getGlobal().getDefaultWindowSeconds())
        );
    }

    /**
     * Check if action is allowed under rate limit
     * @param key - identifier (should NOT contain raw PII; hash it at call site)
     * @param maxAttempts - maximum attempts allowed
     * @param window - time window duration
     * @return true if allowed, false if rate limited
     */
    public boolean isAllowed(String key, int maxAttempts, Duration window) {
        String redisKey = KEY_PREFIX + key;
        if (redisTemplate == null) {
            return handleRedisFailure();
        }

        try {
            RedisScript<Long> script = RedisScript.of(INCR_AND_EXPIRE_SCRIPT, Long.class);
            Long count = redisTemplate.execute(script,
                    List.of(redisKey),
                    String.valueOf(window.getSeconds()));

            boolean allowed = count <= maxAttempts;
            if (!allowed) log.warn("Rate limit exceeded for key: {} ({}/{})", redisKey, count, maxAttempts);
            return allowed;

        } catch (Exception e) {
            log.error("Redis error in rate limiter for key: {}", redisKey, e);
            return handleRedisFailure();
        }
    }
    /**
     * Get remaining attempts for a key
     */
    public int getRemainingAttempts(String key, int maxAttempts) {
        String redisKey = KEY_PREFIX + key;

        try {
            String value = redisTemplate.opsForValue().get(redisKey);
            if (value == null) {
                return maxAttempts;
            }

            int currentCount = Integer.parseInt(value);
            return Math.max(0, maxAttempts - currentCount);

        } catch (Exception e) {
            log.error("Error getting remaining attempts for redisKey: {}", redisKey, e);
            return 0;
        }
    }

    /**
     * Get time until rate limit resets
     */
    public Duration getTimeUntilReset(String key) {
        String redisKey = KEY_PREFIX + key;

        try {
            Long ttl = redisTemplate.getExpire(redisKey);
            if (ttl < 0) {
                return Duration.ZERO;
            }
            return Duration.ofSeconds(ttl);

        } catch (Exception e) {
            log.error("Error getting TTL for redisKey: {}", redisKey, e);
            return Duration.ZERO;
        }
    }


    /**
     * Handle Redis failure based on configuration
     */
    private boolean handleRedisFailure() {
        return config.isFailOpen();
    }
}
