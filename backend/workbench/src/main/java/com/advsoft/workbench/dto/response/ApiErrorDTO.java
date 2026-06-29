package com.advsoft.workbench.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiErrorDTO {
    private String code;
    private String status;
    private String error;
    private Instant timestamp;
}
