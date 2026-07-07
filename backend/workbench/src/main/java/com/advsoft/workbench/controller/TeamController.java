package com.advsoft.workbench.controller;

import com.advsoft.workbench.dto.request.AddTeamMemberDTO;
import com.advsoft.workbench.dto.request.CreateTeamDTO;
import com.advsoft.workbench.dto.request.UpdateTeamDTO;
import com.advsoft.workbench.dto.response.TeamDTO;
import com.advsoft.workbench.dto.response.TeamMemberDTO;
import com.advsoft.workbench.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@Valid @RequestBody CreateTeamDTO dto) {
        TeamDTO team = teamService.createTeam(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(team);
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDTO> getTeam(@PathVariable Long teamId) {
        TeamDTO team = teamService.getTeam(teamId);
        return ResponseEntity.ok(team);
    }

    @GetMapping
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        List<TeamDTO> teams = teamService.getAllTeams();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/my/teams")
    public ResponseEntity<List<TeamDTO>> getUserTeams() {
        List<TeamDTO> teams = teamService.getUserTeams();
        return ResponseEntity.ok(teams);
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<TeamDTO> updateTeam(
            @PathVariable Long teamId,
            @Valid @RequestBody UpdateTeamDTO dto) {
        TeamDTO team = teamService.updateTeam(teamId, dto);
        return ResponseEntity.ok(team);
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamMemberDTO> addMember(
            @PathVariable Long teamId,
            @Valid @RequestBody AddTeamMemberDTO dto) {
        TeamMemberDTO member = teamService.addMember(teamId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberDTO>> getTeamMembers(@PathVariable Long teamId) {
        List<TeamMemberDTO> members = teamService.getTeamMembers(teamId);
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        teamService.removeMember(teamId, userId);
        return ResponseEntity.noContent().build();
    }
}
