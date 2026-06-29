package com.advsoft.workbench.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;


@Entity
@Table(name = "password_reset_session")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PasswordResetSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String sessionHash;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant usedAt;

    @Builder
    public PasswordResetSession(Long userId, String sessionHash, Instant expiresAt) {
        this.userId = userId;
        this.sessionHash = sessionHash;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired(Instant now) {
        return expiresAt.isBefore(now);
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    public void markUsed(Instant now) {
        this.usedAt = now;
    }
}
