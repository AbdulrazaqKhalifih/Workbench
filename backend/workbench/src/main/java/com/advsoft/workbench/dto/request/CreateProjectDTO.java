package com.advsoft.workbench.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectDTO {

    @NotBlank(message = "Project name is required")
    private String name;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @NotNull(message = "Team ID is required")
    private Long teamId;
}
