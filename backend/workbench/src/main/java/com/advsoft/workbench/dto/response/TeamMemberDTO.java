package com.advsoft.workbench.dto.response;

import com.advsoft.workbench.model.TeamMember;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDTO {

    private Long userId;

    private String userName;

    private String email;

    private String role;

    private LocalDateTime joinedAt;

    public static TeamMemberDTO fromEntity(TeamMember member) {
        return new TeamMemberDTO(
                member.getUser().getId(),
                member.getUser().getUsername(),
                member.getUser().getEmail(),
                member.getRole().name(),
                member.getCreatedAt()
        );
    }
}
