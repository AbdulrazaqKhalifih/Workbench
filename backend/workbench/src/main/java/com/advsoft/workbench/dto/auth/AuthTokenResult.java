package com.advsoft.workbench.dto.auth;

import com.advsoft.workbench.dto.response.AuthenticationDTO;

public record AuthTokenResult(
        AuthenticationDTO body,
        String rawRefreshToken,
        long refreshTtlSeconds
) {
}
