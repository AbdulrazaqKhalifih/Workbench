package com.advsoft.workbench.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetCompleteRequestDTO {
    @NotBlank
    @Size(min = 8, max = 128)
    String newPassword;
}
