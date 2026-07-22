package com.advsoft.workbench.dto.request;

import com.advsoft.workbench.enums.UserStatus;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMeDTO {
    private String username;
    @Email
    private String email;
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
    private List<String> roles;
    private UserStatus status;
}
