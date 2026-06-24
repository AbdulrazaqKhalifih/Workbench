package com.workbench.workbench.repository;

import com.workbench.workbench.entity.Comment;
import com.workbench.workbench.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskOrderByCreatedAtAsc(Task task);
}