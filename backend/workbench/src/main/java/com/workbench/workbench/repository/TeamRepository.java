package com.workbench.workbench.repository;

import com.workbench.workbench.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {}