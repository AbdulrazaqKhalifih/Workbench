package com.advsoft.workbench.exception;

import java.time.Duration;

public class RateLimitExceededException extends RuntimeException {

    private final Duration retryAfter;
    private final String rateLimitKey;

    public RateLimitExceededException(String rateLimitKey, Duration retryAfter) {
        super("Rate limit exceeded. Please try again later.");
        this.rateLimitKey = rateLimitKey;
        this.retryAfter = retryAfter;
    }

    public RateLimitExceededException(String message, String rateLimitKey, Duration retryAfter) {
        super(message);
        this.rateLimitKey = rateLimitKey;
        this.retryAfter = retryAfter;
    }

    public Duration getRetryAfter() {
        return retryAfter;
    }

    public String getRateLimitKey() {
        return rateLimitKey;
    }
}
