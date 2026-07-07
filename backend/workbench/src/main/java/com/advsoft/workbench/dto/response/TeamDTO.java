package com.advsoft.workbench.dto.response;

import com.advsoft.workbench.model.Team;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {

    private Long id;

    private String name;

    private LocalDateTime createdAt;

    public static TeamDTO fromEntity(Team team) {
        return new TeamDTO(
                team.getId(),
                team.getName(),
                team.getCreatedAt()
        );
    }
}
