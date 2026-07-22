package com.advsoft.workbench.service;

import com.advsoft.workbench.dto.request.AddTeamMemberDTO;
import com.advsoft.workbench.dto.request.CreateTeamDTO;
import com.advsoft.workbench.dto.request.UpdateTeamDTO;
import com.advsoft.workbench.dto.response.TeamDTO;
import com.advsoft.workbench.dto.response.TeamMemberDTO;
import com.advsoft.workbench.enums.TeamRole;
import com.advsoft.workbench.model.Team;
import com.advsoft.workbench.model.TeamMember;
import com.advsoft.workbench.model.User;
import com.advsoft.workbench.repository.TeamMemberRepository;
import com.advsoft.workbench.repository.TeamRepository;
import com.advsoft.workbench.repository.UserRepository;
import com.advsoft.workbench.util.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TeamDTO createTeam(CreateTeamDTO dto) {
        Team team = new Team();
        team.setName(dto.getName());
        Team saved = teamRepository.save(team);

        Long currentUserId = SecurityContextHelper.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId).orElseThrow();

        TeamMember member = new TeamMember();
        member.setTeam(saved);
        member.setUser(currentUser);
        member.setRole(TeamRole.ADMIN);
        teamMemberRepository.save(member);

        return TeamDTO.fromEntity(saved);
    }

    public TeamDTO getTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return TeamDTO.fromEntity(team);
    }

    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(TeamDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TeamDTO> getUserTeams() {
        Long userId = SecurityContextHelper.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow();
        List<TeamMember> members = teamMemberRepository.findByUser(user);
        return members.stream()
                .map(m -> TeamDTO.fromEntity(m.getTeam()))
                .collect(Collectors.toList());
    }

    public TeamDTO updateTeam(Long teamId, UpdateTeamDTO dto) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        if (dto.getName() != null) {
            team.setName(dto.getName());
        }
        Team updated = teamRepository.save(team);
        return TeamDTO.fromEntity(updated);
    }

    public void deleteTeam(Long teamId) {
        teamRepository.deleteById(teamId);
    }

    public TeamMemberDTO addMember(Long teamId, AddTeamMemberDTO dto) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamMember existing = teamMemberRepository.findByTeamAndUser(team, user).orElse(null);
        if (existing != null) {
            throw new RuntimeException("User is already a member of this team");
        }

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setRole(TeamRole.valueOf(dto.getRole().toUpperCase()));
        TeamMember saved = teamMemberRepository.save(member);

        notificationService.createTeamMemberAddedNotification(user, team.getName());

        return TeamMemberDTO.fromEntity(saved);
    }

    public List<TeamMemberDTO> getTeamMembers(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return teamMemberRepository.findByTeam(team).stream()
                .map(TeamMemberDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public void removeMember(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamMember member = teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        teamMemberRepository.delete(member);

        notificationService.createTeamMemberRemovedNotification(user, team.getName());
    }
}
