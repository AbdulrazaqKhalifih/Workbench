package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.CreateTaskDTO;
import com.advsoft.workbench.dto.request.UpdateTaskDTO;
import com.advsoft.workbench.dto.response.TaskDTO;
import com.advsoft.workbench.enums.TaskStatus;
import com.advsoft.workbench.model.Project;
import com.advsoft.workbench.model.Task;
import com.advsoft.workbench.model.Team;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.ProjectRepository;
import com.advsoft.workbench.repository.TaskRepository;
import com.advsoft.workbench.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private TaskService taskService;

    private Project project;
    private User assignee;
    private User otherUser;

    @BeforeEach
    void setUp() {
        Team team = Team.builder().id(1L).name("Team A").createdAt(LocalDateTime.now()).build();

        project = Project.builder()
                .id(10L).name("Project A").team(team)
                .createdAt(LocalDateTime.now())
                .build();

        assignee = userWithId(100L, "matin");
        otherUser = userWithId(200L, "abood");
    }

    private User userWithId(Long id, String username) {
        User user = User.builder()
                .username(username)
                .email(username + "@example.com")
                .passwordHash("hash")
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    // ---------- createTask ----------

    @Test
    void createTask_savesTask_andTriggersNotification_whenAssigneeProvided() {
        CreateTaskDTO dto = new CreateTaskDTO("Fix bug", "desc", LocalDateTime.now().plusDays(1), 10L, 100L);

        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(userRepository.findById(100L)).thenReturn(Optional.of(assignee));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            ReflectionTestUtils.setField(t, "id", 500L);
            t.setStatus(TaskStatus.TODO);
            t.setCreatedAt(LocalDateTime.now());
            t.setUpdatedAt(LocalDateTime.now());
            return t;
        });

        TaskDTO result = taskService.createTask(dto);

        assertThat(result.getTitle()).isEqualTo("Fix bug");
        assertThat(result.getAssigneeId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo("TODO");
        verify(notificationService, times(1)).createTaskAssignedNotification(eq(assignee), any(Task.class));
    }

    @Test
    void createTask_doesNotTriggerNotification_whenNoAssignee() {
        CreateTaskDTO dto = new CreateTaskDTO("No assignee task", null, null, 10L, null);

        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            ReflectionTestUtils.setField(t, "id", 501L);
            t.setStatus(TaskStatus.TODO);
            t.setCreatedAt(LocalDateTime.now());
            t.setUpdatedAt(LocalDateTime.now());
            return t;
        });

        taskService.createTask(dto);

        verify(notificationService, never()).createTaskAssignedNotification(any(), any());
        verify(userRepository, never()).findById(any());
    }

    @Test
    void createTask_throws_whenProjectNotFound() {
        CreateTaskDTO dto = new CreateTaskDTO("Task", null, null, 999L, null);
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.createTask(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Project not found");

        verify(taskRepository, never()).save(any());
    }

    @Test
    void createTask_throws_whenAssigneeNotFound() {
        CreateTaskDTO dto = new CreateTaskDTO("Task", null, null, 10L, 999L);
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.createTask(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");

        verify(taskRepository, never()).save(any());
    }

    // ---------- getTask ----------

    @Test
    void getTask_returnsTask_whenFound() {
        Task task = Task.builder()
                .id(500L).project(project).title("Existing").status(TaskStatus.TODO)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
        when(taskRepository.findById(500L)).thenReturn(Optional.of(task));

        TaskDTO result = taskService.getTask(500L);

        assertThat(result.getId()).isEqualTo(500L);
        assertThat(result.getTitle()).isEqualTo("Existing");
    }

    @Test
    void getTask_throws_whenNotFound() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTask(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Task not found");
    }

    // ---------- getTasksByProject / getTasksByAssignee / getAllTasks ----------

    @Test
    void getTasksByProject_returnsMappedList() {
        Task t1 = Task.builder().id(1L).project(project).title("A").status(TaskStatus.TODO)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
        Task t2 = Task.builder().id(2L).project(project).title("B").status(TaskStatus.DONE)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(taskRepository.findByProject(project)).thenReturn(List.of(t1, t2));

        List<TaskDTO> result = taskService.getTasksByProject(10L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(TaskDTO::getTitle).containsExactly("A", "B");
    }

    @Test
    void getTasksByAssignee_returnsMappedList() {
        Task t1 = Task.builder().id(1L).project(project).title("Assigned").assignee(assignee)
                .status(TaskStatus.TODO).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        when(userRepository.findById(100L)).thenReturn(Optional.of(assignee));
        when(taskRepository.findByAssignee(assignee)).thenReturn(List.of(t1));

        List<TaskDTO> result = taskService.getTasksByAssignee(100L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAssigneeId()).isEqualTo(100L);
    }

    @Test
    void getAllTasks_returnsAllMapped() {
        Task t1 = Task.builder().id(1L).project(project).title("A").status(TaskStatus.TODO)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
        when(taskRepository.findAll()).thenReturn(List.of(t1));

        List<TaskDTO> result = taskService.getAllTasks();

        assertThat(result).hasSize(1);
    }

    // ---------- updateTask ----------

    @Test
    void updateTask_updatesFields_withoutNotification_whenAssigneeUnchanged() {
        Task task = Task.builder()
                .id(500L).project(project).title("Old title").status(TaskStatus.TODO)
                .assignee(assignee)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();

        UpdateTaskDTO dto = new UpdateTaskDTO("New title", null, null, null, 100L); // same assignee id

        when(taskRepository.findById(500L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskDTO result = taskService.updateTask(500L, dto);

        assertThat(result.getTitle()).isEqualTo("New title");
        verify(notificationService, never()).createTaskAssignedNotification(any(), any());
        verify(userRepository, never()).findById(any());
    }

    @Test
    void updateTask_triggersNotification_whenAssigneeChanges() {
        Task task = Task.builder()
                .id(500L).project(project).title("Task").status(TaskStatus.TODO)
                .assignee(assignee)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();

        UpdateTaskDTO dto = new UpdateTaskDTO(null, null, null, null, 200L); // different assignee

        when(taskRepository.findById(500L)).thenReturn(Optional.of(task));
        when(userRepository.findById(200L)).thenReturn(Optional.of(otherUser));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        taskService.updateTask(500L, dto);

        verify(notificationService, times(1)).createTaskAssignedNotification(eq(otherUser), any(Task.class));
    }

    @Test
    void updateTask_updatesStatus_whenStatusProvided() {
        Task task = Task.builder()
                .id(500L).project(project).title("Task").status(TaskStatus.TODO)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();

        UpdateTaskDTO dto = new UpdateTaskDTO(null, null, "done", null, null);

        when(taskRepository.findById(500L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskDTO result = taskService.updateTask(500L, dto);

        assertThat(result.getStatus()).isEqualTo("DONE");
    }

    @Test
    void updateTask_throws_whenTaskNotFound() {
        UpdateTaskDTO dto = new UpdateTaskDTO("x", null, null, null, null);
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.updateTask(999L, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Task not found");
    }

    // ---------- deleteTask ----------

    @Test
    void deleteTask_callsRepositoryDelete() {
        taskService.deleteTask(500L);
        verify(taskRepository, times(1)).deleteById(500L);
    }
}