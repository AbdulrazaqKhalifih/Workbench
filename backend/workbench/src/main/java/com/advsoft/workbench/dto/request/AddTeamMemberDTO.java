package com.advsoft.workbench.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddTeamMemberDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    private String role = "member";
}
