import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext(null);
const API_BASE_URL = "http://localhost:8080/api/v1";

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Fetch projects on mount or when token changes
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/projects`, { headers });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name, description, teamId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, description, teamId }),
      });
      if (response.ok) {
        const newProject = await response.json();
        setProjects((prev) => [...prev, newProject]);
        return newProject;
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const getProjectsByTeam = (teamId) =>
    projects.filter((project) => String(project.teamId) === String(teamId));

  const getProject = (projectId) => projects.find((p) => p.id === projectId);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        createProject,
        getProjectsByTeam,
        getProject,
        fetchProjects,
        loading,
      }}
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
