package com.advsoft.workbench.model;

import com.advsoft.workbench.enums.UserStatus;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_users_username", columnNames = "username"),
                @UniqueConstraint(name = "uq_users_email", columnNames = "email")
        }
)
@Getter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<UserRole> userRoles = new HashSet<>();

    protected User() {
    }

    @Builder
    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.status = UserStatus.ACTIVE;
    }

    public void addRole(Role role) {
        UserRole userRole = UserRole.builder()
                .user(this)
                .role(role)
                .build();
        userRoles.add(userRole);
        role.getUserRoles().add(userRole);
    }

    public void removeRole(Role role) {
        userRoles.removeIf(userRole -> {
            boolean matches = userRole.getUser().equals(this)
                    && userRole.getRole().equals(role);

            if (matches) {
                role.getUserRoles().remove(userRole);
                userRole.setUser(null);
                userRole.setRole(null);
            }

            return matches;
        });
    }

    public void changeStatus(UserStatus status) {
        this.status = status;
    }

    public void changePassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void changeEmail(String email){
        this.email = email;
    }
}