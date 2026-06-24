import { createContext, useContext, useState } from "react";

const TeamContext = createContext(null);

// Starter mock data
const MOCK_TEAMS = [
  {
    id: "1",
    name: "Core Team",
    description: "The founding team",
    members: [{ userId: "1", role: "admin" }],
  },
];

export function TeamProvider({ children }) {
  const [teams, setTeams] = useState(MOCK_TEAMS);

  const createTeam = (name, description, createdByUserId) => {
    const newTeam = {
      id: String(Date.now()),
      name,
      description,
      members: [{ userId: createdByUserId, role: "admin" }],
    };
    setTeams((prev) => [...prev, newTeam]);
    return newTeam;
  };

  const addMember = (teamId, userId, role = "member") => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId && !t.members.find((m) => m.userId === userId)
          ? { ...t, members: [...t.members, { userId, role }] }
          : t,
      ),
    );
  };

  const getUserRole = (teamId, userId) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return null;
    const member = team.members.find((m) => m.userId === userId);
    return member ? member.role : null;
  };

  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  return (
    <TeamContext.Provider
      value={{ teams, createTeam, addMember, getUserRole, getTeam }}
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
