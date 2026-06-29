package com.advsoft.workbench.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SessionDTO {
    private String deviceName;
    private String ipAddress;
    private Instant lastActive;
    private boolean isCurrent;
    private Long tokenId;
}
