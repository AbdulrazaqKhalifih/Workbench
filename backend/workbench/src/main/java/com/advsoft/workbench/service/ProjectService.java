package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.CreateProjectDTO;
import com.advsoft.workbench.dto.request.UpdateProjectDTO;
import com.advsoft.workbench.dto.response.ProjectDTO;
import com.advsoft.workbench.model.Project;
import com.advsoft.workbench.model.Team;
import com.advsoft.workbench.repository.ProjectRepository;
import com.advsoft.workbench.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;

    public ProjectDTO createProject(CreateProjectDTO dto) {
        Team team = teamRepository.findById(dto.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        Project project = new Project();
        project.setName(dto.getName());
        project.setTeam(team);
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());

        Project saved = projectRepository.save(project);
        return ProjectDTO.fromEntity(saved);
    }

    public ProjectDTO getProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return ProjectDTO.fromEntity(project);
    }

    public List<ProjectDTO> getProjectsByTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return projectRepository.findByTeam(team).stream()
                .map(ProjectDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(ProjectDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ProjectDTO updateProject(Long projectId, UpdateProjectDTO dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (dto.getName() != null) {
            project.setName(dto.getName());
        }
        if (dto.getStartDate() != null) {
            project.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            project.setEndDate(dto.getEndDate());
        }

        Project updated = projectRepository.save(project);
        return ProjectDTO.fromEntity(updated);
    }

    public void deleteProject(Long projectId) {
        projectRepository.deleteById(projectId);
    }
}
