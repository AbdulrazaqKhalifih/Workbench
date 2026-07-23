package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.CreateProjectDTO;
import com.advsoft.workbench.dto.request.UpdateProjectDTO;
import com.advsoft.workbench.dto.response.ProjectDTO;
import com.advsoft.workbench.model.Project;
import com.advsoft.workbench.model.Team;
import com.advsoft.workbench.repository.ProjectRepository;
import com.advsoft.workbench.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private TeamRepository teamRepository;

    @InjectMocks
    private ProjectService projectService;

    private Team team;

    @BeforeEach
    void setUp() {
        team = Team.builder().id(1L).name("Team A").createdAt(LocalDateTime.now()).build();
    }

    // ---------- createProject ----------

    @Test
    void createProject_savesProject_whenTeamExists() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(30);
        CreateProjectDTO dto = new CreateProjectDTO("New Project", start, end, 1L);

        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> {
            Project p = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(p, "id", 20L);
            p.setCreatedAt(LocalDateTime.now());
            return p;
        });

        ProjectDTO result = projectService.createProject(dto);

        assertThat(result.getName()).isEqualTo("New Project");
        assertThat(result.getTeamId()).isEqualTo(1L);
        assertThat(result.getStartDate()).isEqualTo(start);
        assertThat(result.getEndDate()).isEqualTo(end);
    }

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
        Project project = Project.builder().id(20L).name("Project A").team(team)
                .createdAt(LocalDateTime.now()).build();
        when(projectRepository.findById(20L)).thenReturn(Optional.of(project));

        ProjectDTO result = projectService.getProject(20L);

        assertThat(result.getName()).isEqualTo("Project A");
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
        Project p1 = Project.builder().id(1L).name("A").team(team).createdAt(LocalDateTime.now()).build();
        Project p2 = Project.builder().id(2L).name("B").team(team).createdAt(LocalDateTime.now()).build();

        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(projectRepository.findByTeam(team)).thenReturn(List.of(p1, p2));

        List<ProjectDTO> result = projectService.getProjectsByTeam(1L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(ProjectDTO::getName).containsExactly("A", "B");
    }

    @Test
    void getProjectsByTeam_throws_whenTeamNotFound() {
        when(teamRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProjectsByTeam(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Team not found");
    }

    // ---------- getAllProjects ----------

    @Test
    void getAllProjects_returnsAllMapped() {
        Project p1 = Project.builder().id(1L).name("A").team(team).createdAt(LocalDateTime.now()).build();
        when(projectRepository.findAll()).thenReturn(List.of(p1));

        List<ProjectDTO> result = projectService.getAllProjects();

        assertThat(result).hasSize(1);
    }

    // ---------- updateProject ----------

    @Test
    void updateProject_updatesProvidedFields_only() {
        LocalDateTime originalStart = LocalDateTime.now();
        Project project = Project.builder()
                .id(20L).name("Old name").team(team)
                .startDate(originalStart)
                .createdAt(LocalDateTime.now())
                .build();

        UpdateProjectDTO dto = new UpdateProjectDTO("New name", null, null);

        when(projectRepository.findById(20L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        ProjectDTO result = projectService.updateProject(20L, dto);

        assertThat(result.getName()).isEqualTo("New name");
        assertThat(result.getStartDate()).isEqualTo(originalStart); // unchanged since dto had null
    }

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
        projectService.deleteProject(20L);
        verify(projectRepository, times(1)).deleteById(20L);
    }
}