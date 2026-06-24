import { createContext, useContext, useState } from "react";

const ProjectContext = createContext(null);

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Sprint 1",
    description: "Initial project setup",
    teamId: "1",
  },
];

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  const createProject = (name, description, teamId) => {
    const newProject = {
      id: String(Date.now()),
      name,
      description,
      teamId,
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const getProjectsByTeam = (teamId) =>
    projects.filter((p) => p.teamId === teamId);

  const getProject = (projectId) => projects.find((p) => p.id === projectId);

  return (
    <ProjectContext.Provider
      value={{ projects, createProject, getProjectsByTeam, getProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
