package com.advsoft.workbench.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "password_reset_challenge")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PasswordResetChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Transient
    private String channel; // EMAIL

    @Column(nullable = false)
    private String codeHash;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant verifiedAt;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private int attemptCount = 0;

    @Builder
    public PasswordResetChallenge(Long userId, String codeHash, Instant expiresAt) {
        this.userId = userId;
        this.channel = "EMAIL";
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

    public boolean isExpired(Instant now) {
        return expiresAt.isBefore(now);
    }

    public boolean isVerified() {
        return verifiedAt != null;
    }

    public void markVerified(Instant now) {
        this.verifiedAt = now;
    }

    public void incrementAttempts() {
        this.attemptCount++;
    }
}
