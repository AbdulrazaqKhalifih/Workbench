package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.CreateCommentDTO;
import com.advsoft.workbench.dto.response.CommentDTO;
import com.advsoft.workbench.model.Comment;
import com.advsoft.workbench.model.Task;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.CommentRepository;
import com.advsoft.workbench.repository.TaskRepository;
import com.advsoft.workbench.repository.UserRepository;
import com.advsoft.workbench.util.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public CommentDTO createComment(CreateCommentDTO dto) {
        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Long userId = SecurityContextHelper.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setText(dto.getText());

        Comment saved = commentRepository.save(comment);
        return CommentDTO.fromEntity(saved);
    }

    public CommentDTO getComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        return CommentDTO.fromEntity(comment);
    }

    public List<CommentDTO> getCommentsByTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return commentRepository.findByTaskOrderByCreatedAtAsc(task).stream()
                .map(CommentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getAllComments() {
        return commentRepository.findAll().stream()
                .map(CommentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
