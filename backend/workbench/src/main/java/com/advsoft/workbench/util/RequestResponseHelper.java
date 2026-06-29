package com.advsoft.workbench.util;

import jakarta.servlet.http.HttpServletRequest;

public class RequestResponseHelper {

    // Helper to get client IP (handles proxies)
    public static String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    // Optional: Parse user agent to friendly name
    public static String parseDeviceName(String userAgent) {
        if (userAgent == null) return "Unknown Device";

        // Simple parsing (use library like UADetector for better results)
        if (userAgent.contains("iPhone")) return "iPhone";
        if (userAgent.contains("iPad")) return "iPad";
        if (userAgent.contains("Android")) return "Android Device";
        if (userAgent.contains("Chrome")) return "Chrome Browser";
        if (userAgent.contains("Safari")) return "Safari Browser";
        if (userAgent.contains("Firefox")) return "Firefox Browser";

        return "Unknown Device";
    }
}
