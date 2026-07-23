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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock private TeamRepository teamRepository;
    @Mock private TeamMemberRepository teamMemberRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private TeamService teamService;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = User.builder()
                .username("matin").email("matin@example.com").passwordHash("hash").build();
        ReflectionTestUtils.setField(currentUser, "id", 1L);

        // Simulate what JwtFilter does: principal = userId (Long)
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(1L, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ---------- createTeam ----------

    @Test
    void createTeam_savesTeam_andAddsCreatorAsAdmin() {
        CreateTeamDTO dto = new CreateTeamDTO("New Team");

        when(teamRepository.save(any(Team.class))).thenAnswer(inv -> {
            Team t = inv.getArgument(0);
            ReflectionTestUtils.setField(t, "id", 50L);
            t.setCreatedAt(LocalDateTime.now());
            return t;
        });
        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));
        when(teamMemberRepository.save(any(TeamMember.class))).thenAnswer(inv -> inv.getArgument(0));

        TeamDTO result = teamService.createTeam(dto);

        assertThat(result.getName()).isEqualTo("New Team");

        org.mockito.ArgumentCaptor<TeamMember> captor = org.mockito.ArgumentCaptor.forClass(TeamMember.class);
        verify(teamMemberRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(TeamRole.ADMIN);
        assertThat(captor.getValue().getUser()).isEqualTo(currentUser);
    }

    // ---------- getTeam ----------

    @Test
    void getTeam_returnsTeam_whenFound() {
        Team team = Team.builder().id(50L).name("Team A").createdAt(LocalDateTime.now()).build();
        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));

        TeamDTO result = teamService.getTeam(50L);

        assertThat(result.getName()).isEqualTo("Team A");
    }

    @Test
    void getTeam_throws_whenNotFound() {
        when(teamRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.getTeam(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Team not found");
    }

    // ---------- getUserTeams ----------

    @Test
    void getUserTeams_returnsTeamsForCurrentUser() {
        Team team = Team.builder().id(50L).name("Team A").createdAt(LocalDateTime.now()).build();
        TeamMember member = TeamMember.builder()
                .id(1L).team(team).user(currentUser).role(TeamRole.ADMIN)
                .createdAt(LocalDateTime.now()).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));
        when(teamMemberRepository.findByUser(currentUser)).thenReturn(List.of(member));

        List<TeamDTO> result = teamService.getUserTeams();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Team A");
    }

    // ---------- updateTeam ----------

    @Test
    void updateTeam_updatesName() {
        Team team = Team.builder().id(50L).name("Old name").createdAt(LocalDateTime.now()).build();
        UpdateTeamDTO dto = new UpdateTeamDTO("New name");

        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(teamRepository.save(any(Team.class))).thenAnswer(inv -> inv.getArgument(0));

        TeamDTO result = teamService.updateTeam(50L, dto);

        assertThat(result.getName()).isEqualTo("New name");
    }

    // ---------- deleteTeam ----------

    @Test
    void deleteTeam_callsRepositoryDelete() {
        teamService.deleteTeam(50L);
        verify(teamRepository, times(1)).deleteById(50L);
    }

    // ---------- addMember ----------

    @Test
    void addMember_addsNewMember_whenNotAlreadyOnTeam() {
        Team team = Team.builder().id(50L).name("Team A").createdAt(LocalDateTime.now()).build();
        User newUser = User.builder().username("kazi").email("kazi@example.com").passwordHash("h").build();
        ReflectionTestUtils.setField(newUser, "id", 2L);

        AddTeamMemberDTO dto = new AddTeamMemberDTO(2L, "member");

        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(userRepository.findById(2L)).thenReturn(Optional.of(newUser));
        when(teamMemberRepository.findByTeamAndUser(team, newUser)).thenReturn(Optional.empty());
        when(teamMemberRepository.save(any(TeamMember.class))).thenAnswer(inv -> {
            TeamMember tm = inv.getArgument(0);
            tm.setCreatedAt(LocalDateTime.now());
            return tm;
        });

        TeamMemberDTO result = teamService.addMember(50L, dto);

        assertThat(result.getUserId()).isEqualTo(2L);
        assertThat(result.getRole()).isEqualTo("MEMBER");
        verify(notificationService, times(1))
                .createTeamMemberAddedNotification(newUser, "Team A");
    }

    @Test
    void addMember_throws_whenUserAlreadyMember() {
        Team team = Team.builder().id(50L).name("Team A").createdAt(LocalDateTime.now()).build();
        User existingUser = User.builder().username("kazi").email("kazi@example.com").passwordHash("h").build();
        ReflectionTestUtils.setField(existingUser, "id", 2L);
        TeamMember existingMembership = TeamMember.builder()
                .id(5L).team(team).user(existingUser).role(TeamRole.MEMBER)
                .createdAt(LocalDateTime.now()).build();

        AddTeamMemberDTO dto = new AddTeamMemberDTO(2L, "member");

        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(userRepository.findById(2L)).thenReturn(Optional.of(existingUser));
        when(teamMemberRepository.findByTeamAndUser(team, existingUser)).thenReturn(Optional.of(existingMembership));

        assertThatThrownBy(() -> teamService.addMember(50L, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already a member");

        verify(teamMemberRepository, never()).save(any());
        verify(notificationService, never()).createTeamMemberAddedNotification(any(), any());
    }

    // ---------- getTeamMembers ----------

    @Test
    void getTeamMembers_returnsMappedList() {
        Team team = Team.builder().id(50L).name("Team A").createdAt(LocalDateTime.now()).build();
        TeamMember member = TeamMember.builder()
                .id(1L).team(team).user(currentUser).role(TeamRole.ADMIN)
                .createdAt(LocalDateTime.now()).build();

        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.findByTeam(team)).thenReturn(List.of(member));

        List<TeamMemberDTO> result = teamService.getTeamMembers(50L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRole()).isEqualTo("ADMIN");
    }

    // ---------- removeMember ----------

    @Test
    void removeMember_deletesMembership_whenFound() {
        Team team = Team.builder().id(50L).name("Team A").createdAt(LocalDateTime.now()).build();
        TeamMember member = TeamMember.builder()
                .id(1L).team(team).user(currentUser).role(TeamRole.MEMBER)
                .createdAt(LocalDateTime.now()).build();

        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));
        when(teamMemberRepository.findByTeamAndUser(team, currentUser)).thenReturn(Optional.of(member));

        teamService.removeMember(50L, 1L);

        verify(teamMemberRepository, times(1)).delete(member);
        verify(notificationService, times(1))
                .createTeamMemberRemovedNotification(currentUser, "Team A");
    }

    @Test
    void removeMember_throws_whenMembershipNotFound() {
        Team team = Team.builder().id(50L).name("Team A").createdAt(LocalDateTime.now()).build();

        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));
        when(teamMemberRepository.findByTeamAndUser(team, currentUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.removeMember(50L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Member not found");

        verify(notificationService, never()).createTeamMemberRemovedNotification(any(), any());
    }
}