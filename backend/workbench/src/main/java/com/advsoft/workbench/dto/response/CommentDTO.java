package com.advsoft.workbench.dto.response;

import com.advsoft.workbench.model.Comment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {

    private Long id;

    private Long taskId;

    private Long userId;

    private String userName;

    private String text;

    private LocalDateTime createdAt;

    public static CommentDTO fromEntity(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getTask().getId(),
                comment.getUser().getId(),
                comment.getUser().getUsername(),
                comment.getText(),
                comment.getCreatedAt()
        );
    }
}
