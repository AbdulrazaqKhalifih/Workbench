package com.advsoft.workbench.dto.auth;

public record ClientInfo(
        String userAgent,
        String ipAddress,
        String deviceName
) {
}
