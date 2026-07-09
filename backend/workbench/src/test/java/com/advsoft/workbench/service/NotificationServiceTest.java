package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.response.NotificationDTO;
import com.advsoft.workbench.model.Notification;
import com.advsoft.workbench.model.Task;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User user;
    private User otherUser;
    private Task task;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .username("matin")
                .email("matin@example.com")
                .passwordHash("hash")
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);

        otherUser = User.builder()
                .username("someoneElse")
                .email("other@example.com")
                .passwordHash("hash")
                .build();
        ReflectionTestUtils.setField(otherUser, "id", 2L);

        task = Task.builder()
                .id(3L)
                .title("Test 1")
                .build();
    }

    // ---------- createTaskAssignedNotification ----------

    @Test
    void createTaskAssignedNotification_savesNotification_whenAssigneeProvided() {
        notificationService.createTaskAssignedNotification(user, task);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getTask()).isEqualTo(task);
        assertThat(saved.getType()).isEqualTo("TASK_ASSIGNED");
        assertThat(saved.getMessage()).contains("Test 1");
        assertThat(saved.getSentAt()).isNotNull();
    }

    @Test
    void createTaskAssignedNotification_doesNothing_whenAssigneeIsNull() {
        notificationService.createTaskAssignedNotification(null, task);

        verify(notificationRepository, never()).save(any());
    }

    // ---------- getNotificationsForUser ----------

    @Test
    void getNotificationsForUser_returnsMappedDTOs_inRepositoryOrder() {
        Notification n1 = Notification.builder()
                .id(10L).user(user).task(task)
                .message("First").type("TASK_ASSIGNED")
                .sentAt(LocalDateTime.now().minusMinutes(5))
                .build();
        Notification n2 = Notification.builder()
                .id(11L).user(user).task(task)
                .message("Second").type("TASK_ASSIGNED")
                .sentAt(LocalDateTime.now())
                .readAt(LocalDateTime.now())
                .build();

        when(notificationRepository.findByUserOrderBySentAtDesc(user))
                .thenReturn(List.of(n2, n1));

        List<NotificationDTO> result = notificationService.getNotificationsForUser(user);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getMessage()).isEqualTo("Second");
        assertThat(result.get(0).isRead()).isTrue();
        assertThat(result.get(1).getMessage()).isEqualTo("First");
        assertThat(result.get(1).isRead()).isFalse();
    }

    @Test
    void getNotificationsForUser_returnsEmptyList_whenNoneExist() {
        when(notificationRepository.findByUserOrderBySentAtDesc(user))
                .thenReturn(List.of());

        List<NotificationDTO> result = notificationService.getNotificationsForUser(user);

        assertThat(result).isEmpty();
    }

    // ---------- getUnreadCount ----------

    @Test
    void getUnreadCount_returnsSizeOfUnreadList() {
        Notification unread1 = Notification.builder().id(1L).user(user).message("a").build();
        Notification unread2 = Notification.builder().id(2L).user(user).message("b").build();

        when(notificationRepository.findByUserAndReadAtIsNull(user))
                .thenReturn(List.of(unread1, unread2));

        long count = notificationService.getUnreadCount(user);

        assertThat(count).isEqualTo(2);
    }

    // ---------- markAsRead ----------

    @Test
    void markAsRead_setsReadAt_whenNotificationBelongsToUser() {
        Notification notification = Notification.builder()
                .id(5L).user(user).message("msg").build();

        when(notificationRepository.findById(5L)).thenReturn(java.util.Optional.of(notification));

        notificationService.markAsRead(5L, user);

        assertThat(notification.getReadAt()).isNotNull();
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsRead_throws_whenNotificationBelongsToDifferentUser() {
        Notification notification = Notification.builder()
                .id(5L).user(otherUser).message("msg").build();

        when(notificationRepository.findById(5L)).thenReturn(java.util.Optional.of(notification));

        assertThatThrownBy(() -> notificationService.markAsRead(5L, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Not authorized");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAsRead_throws_whenNotificationDoesNotExist() {
        when(notificationRepository.findById(99L)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(99L, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Notification not found");
    }

    // ---------- markAllAsRead ----------

    @Test
    void markAllAsRead_setsReadAtOnAllUnreadNotifications() {
        Notification n1 = Notification.builder().id(1L).user(user).message("a").build();
        Notification n2 = Notification.builder().id(2L).user(user).message("b").build();

        when(notificationRepository.findByUserAndReadAtIsNull(user))
                .thenReturn(List.of(n1, n2));

        notificationService.markAllAsRead(user);

        assertThat(n1.getReadAt()).isNotNull();
        assertThat(n2.getReadAt()).isNotNull();
        verify(notificationRepository).saveAll(List.of(n1, n2));
    }

    @Test
    void markAllAsRead_doesNothing_whenNoUnreadNotifications() {
        when(notificationRepository.findByUserAndReadAtIsNull(user))
                .thenReturn(List.of());

        notificationService.markAllAsRead(user);

        verify(notificationRepository).saveAll(List.of());
    }
}