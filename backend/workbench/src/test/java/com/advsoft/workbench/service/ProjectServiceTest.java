package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.CreateProjectDTO;
import com.advsoft.workbench.dto.request.UpdateProjectDTO;
import com.advsoft.workbench.dto.response.ProjectDTO;
import com.advsoft.workbench.enums.TaskStatus;
import com.advsoft.workbench.model.Project;
import com.advsoft.workbench.model.Team;
import com.advsoft.workbench.repository.ProjectRepository;
import com.advsoft.workbench.repository.TaskRepository;
import com.advsoft.workbench.repository.TeamRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private ProjectService projectService;

    private Team team;
    private Project project;

    @BeforeEach
    void setUp() {
        team = Team.builder()
                .name("Team Alpha")
                .build();
        ReflectionTestUtils.setField(team, "id", 11L);

        project = Project.builder()
                .name("Launch")
                .team(team)
                .createdAt(LocalDateTime.now())
                .build();
        ReflectionTestUtils.setField(project, "id", 21L);
    }

    // ---------- createProject (progress counts) — Dawit's tests ----------

    @Test
    void createProjectReturnsCountsAndPersistsTeam() {
        when(teamRepository.findById(11L)).thenReturn(Optional.of(team));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 21L);
            return saved;
        });
        when(taskRepository.countByProject(any(Project.class))).thenReturn(5L);
        when(taskRepository.countByProjectAndStatus(any(Project.class), eq(TaskStatus.DONE))).thenReturn(2L);

        var result = projectService.createProject(new CreateProjectDTO("Launch", null, null, 11L));

        assertThat(result.getId()).isEqualTo(21L);
        assertThat(result.getTeamId()).isEqualTo(11L);
        assertThat(result.getTotalTaskCount()).isEqualTo(5L);
        assertThat(result.getCompletedTaskCount()).isEqualTo(2L);
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void getAllProjectsIncludesProgressCounts() {
        when(projectRepository.findAll()).thenReturn(List.of(project));
        when(taskRepository.countByProject(project)).thenReturn(3L);
        when(taskRepository.countByProjectAndStatus(project, TaskStatus.DONE)).thenReturn(1L);

        var result = projectService.getAllProjects();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTotalTaskCount()).isEqualTo(3L);
        assertThat(result.get(0).getCompletedTaskCount()).isEqualTo(1L);
    }

    @Test
    void updateProjectReturnsRefreshedProgressCounts() {
        when(projectRepository.findById(21L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.countByProject(project)).thenReturn(4L);
        when(taskRepository.countByProjectAndStatus(project, TaskStatus.DONE)).thenReturn(4L);

        var result = projectService.updateProject(21L, new UpdateProjectDTO("Updated", null, null));

        assertThat(result.getName()).isEqualTo("Updated");
        assertThat(result.getTotalTaskCount()).isEqualTo(4L);
        assertThat(result.getCompletedTaskCount()).isEqualTo(4L);
    }

    // ---------- createProject — not-found path ----------

    @Test
    void createProject_throws_whenTeamNotFound() {
        CreateProjectDTO dto = new CreateProjectDTO("New Project", null, null, 999L);
        when(teamRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.createProject(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Team not found");

        verify(projectRepository, never()).save(any());
    }

    // ---------- getProject ----------

    @Test
    void getProject_returnsProject_whenFound() {
        when(projectRepository.findById(21L)).thenReturn(Optional.of(project));

        ProjectDTO result = projectService.getProject(21L);

        assertThat(result.getName()).isEqualTo("Launch");
    }

    @Test
    void getProject_throws_whenNotFound() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProject(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Project not found");
    }

    // ---------- getProjectsByTeam ----------

    @Test
    void getProjectsByTeam_returnsMappedList() {
        Project p2 = Project.builder().name("Second").team(team).createdAt(LocalDateTime.now()).build();
        ReflectionTestUtils.setField(p2, "id", 22L);

        when(teamRepository.findById(11L)).thenReturn(Optional.of(team));
        when(projectRepository.findByTeam(team)).thenReturn(List.of(project, p2));

        List<ProjectDTO> result = projectService.getProjectsByTeam(11L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(ProjectDTO::getName).containsExactly("Launch", "Second");
    }

    @Test
    void getProjectsByTeam_throws_whenTeamNotFound() {
        when(teamRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProjectsByTeam(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Team not found");
    }

    // ---------- updateProject — not-found path ----------

    @Test
    void updateProject_throws_whenNotFound() {
        UpdateProjectDTO dto = new UpdateProjectDTO("x", null, null);
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.updateProject(999L, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Project not found");
    }

    // ---------- deleteProject ----------

    @Test
    void deleteProject_callsRepositoryDelete() {
        projectService.deleteProject(21L);
        verify(projectRepository, times(1)).deleteById(21L);
    }
}