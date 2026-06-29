package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    /**
     * Revoke all active tokens for a user
     * Used when token reuse is detected (security measure)
     *
     * Returns: Number of tokens revoked
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revokedAt = :now " +
            "WHERE rt.user.id = :userId AND rt.revokedAt IS NULL")
    int revokeAllActiveForUser(@Param("userId") Long userId, @Param("now") Instant now);

    /**
     * Convenience method for revokeAllActiveForUser
     */
    default int revokeAllActiveForUser(Long userId) {
        return revokeAllActiveForUser(userId, Instant.now());
    }

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);


    // Find active sessions for user
    @Query("SELECT rt FROM RefreshToken rt " +
            "WHERE rt.user.id = :userId " +
            "AND rt.revokedAt IS NULL " +
            "AND rt.expiresAt > :now")
    List<RefreshToken> findActiveByUserId(
            @Param("userId") Long userId,
            @Param("now") Instant now
    );

    default List<RefreshToken> findActiveByUserId(Long userId) {
        return findActiveByUserId(userId, Instant.now());
    }
}
