package com.advsoft.workbench.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskDTO {

    private String title;

    private String description;

    private String status;

    private LocalDateTime dueDate;

    private Long assigneeId;
}
