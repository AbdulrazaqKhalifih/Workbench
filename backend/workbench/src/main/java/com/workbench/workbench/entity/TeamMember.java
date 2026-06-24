package com.workbench.workbench.entity;

import com.workbench.workbench.enums.TeamRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "team_members")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TeamMember {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TeamRole role;
}