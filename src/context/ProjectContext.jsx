import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext(null);
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token],
  );

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/projects`, { headers });
      if (response.status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.reload();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  // Fetch projects on mount or when token changes
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token, fetchProjects]);

  const createProject = async (name, teamId) => {
    // Optimistic: add immediately
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      name,
      totalTaskCount: 0,
      completedTaskCount: 0,
      teamId: Number(teamId),
    };
    setProjects((prev) => [...prev, optimistic]);

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, teamId }),
      });
      if (response.ok) {
        const newProject = await response.json();
        setProjects((prev) =>
          prev.map((p) => (String(p.id) === tempId ? newProject : p)),
        );
        return newProject;
      }
      setProjects((prev) => prev.filter((p) => String(p.id) !== tempId));
    } catch (error) {
      setProjects((prev) => prev.filter((p) => String(p.id) !== tempId));
      console.error("Failed to create project:", error);
    }
  };

  const deleteProject = async (projectId) => {
    // Optimistic: remove immediately
    const deleted = [];
    setProjects((prev) => {
      const removed = prev.filter((p) => String(p.id) === String(projectId));
      deleted.push(...removed);
      return prev.filter((p) => String(p.id) !== String(projectId));
    });

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) return true;
      setProjects((prev) => [...prev, ...deleted]);
      return false;
    } catch (error) {
      setProjects((prev) => [...prev, ...deleted]);
      console.error("Failed to delete project:", error);
      return false;
    }
  };

  const updateProject = async (projectId, updates) => {
    // Optimistic: update immediately
    setProjects((prev) =>
      prev.map((p) =>
        String(p.id) === String(projectId) ? { ...p, ...updates } : p,
      ),
    );

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setProjects((prev) =>
          prev.map((p) =>
            String(p.id) === String(projectId) ? { ...p, ...updated } : p,
          ),
        );
        return updated;
      }
      return null;
    } catch (error) {
      console.error("Failed to update project:", error);
      return null;
    }
  };

  const getProjectsByTeam = (teamId) =>
    projects.filter((project) => String(project.teamId) === String(teamId));

  const getProject = (projectId) =>
    projects.find((p) => String(p.id) === String(projectId));

  return (
    <ProjectContext.Provider
      value={{
        projects,
        createProject,
        deleteProject,
        updateProject,
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
