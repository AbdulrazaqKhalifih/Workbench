import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";

const TeamContext = createContext(null);
const API_BASE_URL = "http://localhost:8080/api/v1";

export function TeamProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token],
  );

  // Fetch teams on mount or when token changes
  useEffect(() => {
    if (token) {
      fetchTeams();
    }
  }, [token]);

  const fetchTeamMembers = async (teamId) => {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
      headers,
    });
    if (response.status === 403) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.reload();
      return [];
    }
    if (!response.ok) {
      return [];
    }

    return response.json();
  };

  const hydrateTeamMembers = async (teamId) => {
    try {
      const members = await fetchTeamMembers(teamId);
      setTeams((prev) =>
        prev.map((team) =>
          String(team.id) === String(teamId) ? { ...team, members } : team,
        ),
      );
    } catch (error) {
      console.error(
        `Failed to hydrate team members for team ${teamId}:`,
        error,
      );
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/my/teams`, {
        headers,
      });
      if (response.status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.reload();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        const enrichedTeams = await Promise.all(
          data.map(async (team) => ({
            ...team,
            members: await fetchTeamMembers(team.id),
          })),
        );
        setTeams(enrichedTeams);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name, description) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        const newTeam = await response.json();
        const teamWithMembers = {
          ...newTeam,
          members: user
            ? [
                {
                  userId: user.id,
                  userName: user.username,
                  email: user.email,
                  role: "ADMIN",
                },
              ]
            : [],
        };
        setTeams((prev) => [...prev, teamWithMembers]);
        hydrateTeamMembers(newTeam.id);
        return newTeam;
      }
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const addMember = async (teamId, userId, role = "member") => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId, role }),
      });

      if (response.ok) {
        const updatedMembers = await fetchTeamMembers(teamId);
        setTeams((prev) =>
          prev.map((team) =>
            String(team.id) === String(teamId)
              ? { ...team, members: updatedMembers }
              : team,
          ),
        );
        return await response.json();
      }
    } catch (error) {
      console.error("Failed to add team member:", error);
    }
  };

  const getUserRole = (teamId, userId) => {
    const team = teams.find((t) => String(t.id) === String(teamId));
    const member = team?.members?.find(
      (m) => String(m.userId) === String(userId),
    );
    return member?.role ? String(member.role).toUpperCase() : null;
  };

  const getTeam = (teamId) =>
    teams.find((t) => String(t.id) === String(teamId));

  return (
    <TeamContext.Provider
      value={{
        teams,
        createTeam,
        getTeam,
        getUserRole,
        addMember,
        fetchTeams,
        fetchTeamMembers,
        loading,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeams() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeams must be used within TeamProvider");
  return ctx;
}
