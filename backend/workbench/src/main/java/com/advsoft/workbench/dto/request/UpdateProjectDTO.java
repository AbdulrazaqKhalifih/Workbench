package com.advsoft.workbench.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectDTO {

    private String name;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
