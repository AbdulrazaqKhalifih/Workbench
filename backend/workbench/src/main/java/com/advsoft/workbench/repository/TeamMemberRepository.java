package com.advsoft.workbench.repository;

import com.advsoft.workbench.model.Team;
import com.advsoft.workbench.model.TeamMember;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeam(Team team);
    List<TeamMember> findByUser(User user);
    Optional<TeamMember> findByTeamAndUser(Team team, User user);
}