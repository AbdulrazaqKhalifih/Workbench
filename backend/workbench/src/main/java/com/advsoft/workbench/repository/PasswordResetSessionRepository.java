package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.PasswordResetSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetSessionRepository
        extends JpaRepository<PasswordResetSession, Long> {

    Optional<PasswordResetSession> findBySessionHash(String sessionHash);

    @Modifying
    @Query("""
        UPDATE PasswordResetSession s
        SET s.usedAt = :now
        WHERE s.id = :id
          AND s.usedAt IS NULL
          AND s.expiresAt > :now
    """)
    int markUsedIfUnused(@Param("id") Long id, @Param("now") Instant now);

    @Modifying
    @Query("""
        DELETE FROM PasswordResetSession s
        WHERE s.userId = :userId
    """)
    int deleteAllForUser(@Param("userId") Long userId);
}
