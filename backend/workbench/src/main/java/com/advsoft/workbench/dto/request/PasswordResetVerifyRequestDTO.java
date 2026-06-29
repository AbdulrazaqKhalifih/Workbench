package com.advsoft.workbench.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetVerifyRequestDTO {
    @Email
    @NotBlank
    String email;

    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "Code must be 6 digits")
    String code;
}
