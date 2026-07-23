package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.Project;
import com.advsoft.workbench.model.Task;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.model.*;
import com.advsoft.workbench.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User assignee);
    List<Task> findByProjectAndStatus(Project project, TaskStatus status);
    long countByProject(Project project);
    long countByProjectAndStatus(Project project, TaskStatus status);
}