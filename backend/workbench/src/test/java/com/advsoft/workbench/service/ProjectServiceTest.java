package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.CreateProjectDTO;
import com.advsoft.workbench.dto.request.UpdateProjectDTO;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

    @Test
    void createProjectReturnsCountsAndPersistsTeam() {
        when(teamRepository.findById(11L)).thenReturn(Optional.of(team));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 21L);
            return saved;
        });
        when(taskRepository.countByProject(any(Project.class))).thenReturn(5L);
        when(taskRepository.countByProjectAndStatus(any(Project.class), org.mockito.ArgumentMatchers.eq(TaskStatus.DONE))).thenReturn(2L);

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
}
