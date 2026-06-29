package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {}