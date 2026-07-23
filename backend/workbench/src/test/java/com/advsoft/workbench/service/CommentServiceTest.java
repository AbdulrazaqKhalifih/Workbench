package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.CreateCommentDTO;
import com.advsoft.workbench.dto.response.CommentDTO;
import com.advsoft.workbench.model.Comment;
import com.advsoft.workbench.model.Project;
import com.advsoft.workbench.model.Task;
import com.advsoft.workbench.model.Team;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.CommentRepository;
import com.advsoft.workbench.repository.TaskRepository;
import com.advsoft.workbench.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock private CommentRepository commentRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private CommentService commentService;

    private Task task;
    private User currentUser;

    @BeforeEach
    void setUp() {
        Team team = Team.builder().id(1L).name("Team A").createdAt(LocalDateTime.now()).build();
        Project project = Project.builder().id(1L).name("Project A").team(team)
                .createdAt(LocalDateTime.now()).build();
        task = Task.builder().id(1L).project(project).title("Task A")
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        currentUser = User.builder().username("matin").email("matin@example.com").passwordHash("hash").build();
        ReflectionTestUtils.setField(currentUser, "id", 1L);

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(1L, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ---------- createComment ----------

    @Test
    void createComment_savesComment_attributedToCurrentUser() {
        CreateCommentDTO dto = new CreateCommentDTO("This is a comment", 1L);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));
        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> {
            Comment c = inv.getArgument(0);
            ReflectionTestUtils.setField(c, "id", 30L);
            c.setCreatedAt(LocalDateTime.now());
            return c;
        });

        CommentDTO result = commentService.createComment(dto);

        assertThat(result.getText()).isEqualTo("This is a comment");
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getTaskId()).isEqualTo(1L);
    }

    @Test
    void createComment_throws_whenTaskNotFound() {
        CreateCommentDTO dto = new CreateCommentDTO("Comment", 999L);
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.createComment(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Task not found");

        verify(commentRepository, never()).save(any());
    }

    // ---------- getComment ----------

    @Test
    void getComment_returnsComment_whenFound() {
        Comment comment = Comment.builder().id(30L).task(task).user(currentUser).text("Hi")
                .createdAt(LocalDateTime.now()).build();
        when(commentRepository.findById(30L)).thenReturn(Optional.of(comment));

        CommentDTO result = commentService.getComment(30L);

        assertThat(result.getText()).isEqualTo("Hi");
    }

    @Test
    void getComment_throws_whenNotFound() {
        when(commentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.getComment(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Comment not found");
    }

    // ---------- getCommentsByTask ----------

    @Test
    void getCommentsByTask_returnsMappedListInOrder() {
        Comment c1 = Comment.builder().id(1L).task(task).user(currentUser).text("First")
                .createdAt(LocalDateTime.now().minusMinutes(5)).build();
        Comment c2 = Comment.builder().id(2L).task(task).user(currentUser).text("Second")
                .createdAt(LocalDateTime.now()).build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(commentRepository.findByTaskOrderByCreatedAtAsc(task)).thenReturn(List.of(c1, c2));

        List<CommentDTO> result = commentService.getCommentsByTask(1L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(CommentDTO::getText).containsExactly("First", "Second");
    }

    @Test
    void getCommentsByTask_throws_whenTaskNotFound() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.getCommentsByTask(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Task not found");
    }

    // ---------- getAllComments ----------

    @Test
    void getAllComments_returnsAllMapped() {
        Comment c1 = Comment.builder().id(1L).task(task).user(currentUser).text("A")
                .createdAt(LocalDateTime.now()).build();
        when(commentRepository.findAll()).thenReturn(List.of(c1));

        List<CommentDTO> result = commentService.getAllComments();

        assertThat(result).hasSize(1);
    }

    // ---------- deleteComment ----------

    @Test
    void deleteComment_callsRepositoryDelete() {
        commentService.deleteComment(30L);
        verify(commentRepository, times(1)).deleteById(30L);
    }
}