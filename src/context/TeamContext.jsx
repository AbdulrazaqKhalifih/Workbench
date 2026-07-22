import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";

const TeamContext = createContext(null);
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

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

  const deleteTeam = async (teamId) => {
    // Optimistic: remove immediately
    const deleted = [];
    setTeams((prev) => {
      const removed = prev.filter((t) => String(t.id) === String(teamId));
      deleted.push(...removed);
      return prev.filter((t) => String(t.id) !== String(teamId));
    });

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) return true;
      setTeams((prev) => [...prev, ...deleted]);
      return false;
    } catch (error) {
      setTeams((prev) => [...prev, ...deleted]);
      console.error("Failed to delete team:", error);
      return false;
    }
  };

  const updateTeam = async (teamId, updates) => {
    // Optimistic: update immediately
    setTeams((prev) =>
      prev.map((t) =>
        String(t.id) === String(teamId) ? { ...t, ...updates } : t,
      ),
    );

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setTeams((prev) =>
          prev.map((t) =>
            String(t.id) === String(teamId) ? { ...t, ...updated } : t,
          ),
        );
        return updated;
      }
      return null;
    } catch (error) {
      console.error("Failed to update team:", error);
      return null;
    }
  };

  const removeMember = async (teamId, userId) => {
    // Optimistic: remove member immediately
    const prevMembers = [];
    setTeams((prev) =>
      prev.map((team) => {
        if (String(team.id) === String(teamId)) {
          prevMembers.push(...(team.members || []));
          return {
            ...team,
            members: (team.members || []).filter(
              (m) => String(m.userId) !== String(userId),
            ),
          };
        }
        return team;
      }),
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/teams/${teamId}/members/${userId}`,
        { method: "DELETE", headers },
      );
      if (response.ok) {
        const updatedMembers = await fetchTeamMembers(teamId);
        setTeams((prev) =>
          prev.map((team) =>
            String(team.id) === String(teamId)
              ? { ...team, members: updatedMembers }
              : team,
          ),
        );
        return true;
      }
      // Restore
      setTeams((prev) =>
        prev.map((team) =>
          String(team.id) === String(teamId)
            ? { ...team, members: prevMembers }
            : team,
        ),
      );
      return false;
    } catch (error) {
      setTeams((prev) =>
        prev.map((team) =>
          String(team.id) === String(teamId)
            ? { ...team, members: prevMembers }
            : team,
        ),
      );
      console.error("Failed to remove member:", error);
      return false;
    }
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
        removeMember,
        deleteTeam,
        updateTeam,
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
