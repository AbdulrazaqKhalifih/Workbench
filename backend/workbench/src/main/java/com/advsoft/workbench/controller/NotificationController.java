package com.advsoft.workbench.controller;

import com.advsoft.workbench.dto.response.NotificationDTO;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.UserRepository;
import com.advsoft.workbench.service.NotificationService;
import com.advsoft.workbench.util.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User resolveCurrentUser() {
        Long userId = SecurityContextHelper.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping
    public List<NotificationDTO> getMyNotifications() {
        return notificationService.getNotificationsForUser(resolveCurrentUser());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        return Map.of("unreadCount", notificationService.getUnreadCount(resolveCurrentUser()));
    }

    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id, resolveCurrentUser());
    }

    @PatchMapping("/read-all")
    public void markAllAsRead() {
        notificationService.markAllAsRead(resolveCurrentUser());
    }
}