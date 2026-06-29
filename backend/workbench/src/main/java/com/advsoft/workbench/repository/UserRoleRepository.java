package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.UserRole;
import com.advsoft.workbench.model.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    @Query("SELECT ur FROM UserRole ur WHERE ur.user.id = :userId")
    List<UserRole> findAllByUserId(@Param("userId") Long userId);
}
