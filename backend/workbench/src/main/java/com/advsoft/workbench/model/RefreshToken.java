package com.advsoft.workbench.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "refresh_token")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class RefreshToken {
    @Id
    @Column(nullable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    // Track device/session info
    @Column(name="user_agent", length = 500)
    private String userAgent;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    @Builder
    public RefreshToken(Long id, User user, String tokenHash, String userAgent, String ipAddress, String deviceName, Instant expiresAt) {
        this.id = id;
        this.user = user;
        this.tokenHash = tokenHash;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
        this.deviceName = deviceName;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public boolean isRevoked() { return revokedAt != null; }
    public boolean isExpired() {
        Instant now = Instant.now();
        return expiresAt.isBefore(now) || expiresAt.equals(now);
    }
    public void revoke() {
        this.revokedAt = Instant.now();
    }
}
