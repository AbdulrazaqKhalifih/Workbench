package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.PasswordResetChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetChallengeRepository
        extends JpaRepository<PasswordResetChallenge, Long> {

    Optional<PasswordResetChallenge>
    findFirstByUserIdAndVerifiedAtIsNullOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("""
        UPDATE PasswordResetChallenge c
        SET c.verifiedAt = :now
        WHERE c.id = :id
          AND c.verifiedAt IS NULL
          AND c.expiresAt > :now
          AND c.attemptCount < 5
    """)
    int markVerifiedIfValid(@Param("id") Long id, @Param("now") Instant now);

    @Modifying
    @Query("""
        UPDATE PasswordResetChallenge c
        SET c.attemptCount = c.attemptCount + 1
        WHERE c.id = :id
          AND c.verifiedAt IS NULL
          AND c.expiresAt > :now
          AND c.attemptCount < 5
    """)
    int incrementAttemptsIfValid(@Param("id") Long id, @Param("now") Instant now);

    @Modifying
    @Query("""
        UPDATE PasswordResetChallenge c
        SET c.verifiedAt = :now
        WHERE c.userId = :userId
          AND c.verifiedAt IS NULL
    """)
    int invalidateActiveForUser(@Param("userId") Long userId, @Param("now") Instant now);
}
