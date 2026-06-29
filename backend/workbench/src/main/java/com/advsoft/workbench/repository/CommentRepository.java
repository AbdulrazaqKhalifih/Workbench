package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.Comment;
import com.advsoft.workbench.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskOrderByCreatedAtAsc(Task task);
}