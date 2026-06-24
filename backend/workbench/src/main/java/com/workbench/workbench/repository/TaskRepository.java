package com.workbench.workbench.repository;

import com.workbench.workbench.entity.*;
import com.workbench.workbench.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User assignee);
    List<Task> findByProjectAndStatus(Project project, TaskStatus status);
}