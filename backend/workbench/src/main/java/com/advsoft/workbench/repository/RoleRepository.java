package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

    @Query("SELECT r FROM Role r JOIN r.userRoles ur WHERE ur.user.id = :userId")
    List<Role> findAllByUserId(@Param("userId") Long userId);
}
