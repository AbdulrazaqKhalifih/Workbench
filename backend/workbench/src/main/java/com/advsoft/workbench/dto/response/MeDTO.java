package com.advsoft.workbench.dto.response;

import com.advsoft.workbench.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeDTO {
    private Long userId;
    private String email;
    private List<String> roles;
    private UserStatus status;
}
