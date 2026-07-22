package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.response.NotificationDTO;
import com.advsoft.workbench.model.Notification;
import com.advsoft.workbench.model.Task;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createTaskAssignedNotification(User assignee, Task task) {
        if (assignee == null) return;

        Notification notification = Notification.builder()
                .user(assignee)
                .task(task)
                .message("You have been assigned to task: " + task.getTitle())
                .type("TASK_ASSIGNED")
                .sentAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public void createTeamMemberAddedNotification(User recipient, String teamName) {
        if (recipient == null) return;

        Notification notification = Notification.builder()
                .user(recipient)
                .message("You have been added to team: " + teamName)
                .type("TEAM_MEMBER_ADDED")
                .sentAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public void createTeamMemberRemovedNotification(User recipient, String teamName) {
        if (recipient == null) return;

        Notification notification = Notification.builder()
                .user(recipient)
                .message("You have been removed from team: " + teamName)
                .type("TEAM_MEMBER_REMOVED")
                .sentAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderBySentAtDesc(user)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public long getUnreadCount(User user) {
        return notificationRepository.findByUserAndReadAtIsNull(user).size();
    }

    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized to modify this notification");
        }

        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndReadAtIsNull(user);
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(n -> n.setReadAt(now));
        notificationRepository.saveAll(unread);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .taskId(n.getTask() != null ? n.getTask().getId() : null)
                .message(n.getMessage())
                .type(n.getType())
                .sentAt(n.getSentAt())
                .readAt(n.getReadAt())
                .read(n.getReadAt() != null)
                .build();
    }
}