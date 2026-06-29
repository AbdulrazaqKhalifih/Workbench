package com.advsoft.workbench.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitConfig {

    /**
     * Whether to allow requests when Redis is unavailable (fail-open)
     * true = fail-open (allow requests, less secure but more available)
     * false = fail-closed (deny requests, more secure but less available)
     */
    private boolean failOpen = false;

    /**
     * Global rate limit settings
     */
    private Global global = new Global();

    public static class Global {
        private int defaultMaxAttempts = 100;
        private int defaultWindowSeconds = 3600; // 1 hour

        public int getDefaultMaxAttempts() { return defaultMaxAttempts; }
        public void setDefaultMaxAttempts(int defaultMaxAttempts) {
            this.defaultMaxAttempts = defaultMaxAttempts;
        }

        public int getDefaultWindowSeconds() { return defaultWindowSeconds; }
        public void setDefaultWindowSeconds(int defaultWindowSeconds) {
            this.defaultWindowSeconds = defaultWindowSeconds;
        }
    }

    public boolean isFailOpen() { return failOpen; }
    public void setFailOpen(boolean failOpen) { this.failOpen = failOpen; }

    public Global getGlobal() { return global; }
    public void setGlobal(Global global) { this.global = global; }
}
