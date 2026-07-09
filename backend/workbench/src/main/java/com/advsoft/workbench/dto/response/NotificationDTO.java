package com.advsoft.workbench.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private Long taskId;
    private String message;
    private String type;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private boolean read;
}