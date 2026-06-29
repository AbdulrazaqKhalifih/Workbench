package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.Project;
import com.advsoft.workbench.model.Team;
import com.advsoft.workbench.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByTeam(Team team);
}