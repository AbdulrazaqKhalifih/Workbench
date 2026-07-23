package com.advsoft.workbench.dto.response;

import com.advsoft.workbench.model.Project;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {

    private Long id;

    private String name;

    private long totalTaskCount;

    private long completedTaskCount;

    private Long teamId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private LocalDateTime createdAt;

    public static ProjectDTO fromEntity(Project project, long totalTaskCount, long completedTaskCount) {
        return new ProjectDTO(
                project.getId(),
                project.getName(),
                totalTaskCount,
                completedTaskCount,
                project.getTeam().getId(),
                project.getStartDate(),
                project.getEndDate(),
                project.getCreatedAt()
        );
    }
}
