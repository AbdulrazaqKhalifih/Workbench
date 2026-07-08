import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";

const TaskContext = createContext(null);
const API_BASE_URL = "http://localhost:8080/api/v1";

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token],
  );

  const fetchTasksByProject = useCallback(
    async (projectId) => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/tasks/project/${projectId}`,
          { headers },
        );
        if (response.status === 403) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.reload();
          return [];
        }
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
          return data;
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [headers],
  );

  const fetchTasksByAssignee = useCallback(
    async (assigneeId) => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/tasks/assignee/${assigneeId}`,
          { headers },
        );
        if (response.status === 403) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.reload();
          return [];
        }
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
          return data;
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [headers],
  );

  const createTask = async (
    title,
    description,
    projectId,
    assigneeId,
    dueDate,
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          description,
          projectId,
          ...(assigneeId && { assigneeId }),
          ...(dueDate && { dueDate }),
        }),
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      }
      try {
        const err = await response.json();
        return { error: err.message || err.error || "Failed to create task" };
      } catch {
        return { error: "Failed to create task" };
      }
    } catch (error) {
      return { error: error.message || "Failed to create task" };
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setTasks((prev) =>
          prev.map((t) => (String(t.id) === String(taskId) ? updated : t)),
        );
        return updated;
      }
      const err = await response.json();
      return { error: err.message || "Failed to update task" };
    } catch (error) {
      return { error: error.message || "Failed to update task" };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        setTasks((prev) => prev.filter((t) => String(t.id) !== String(taskId)));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete task:", error);
      return false;
    }
  };

  // --- Comments ---
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(
    async (taskId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/comments/task/${taskId}`,
          { headers },
        );
        if (response.status === 403) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.reload();
          return [];
        }
        if (response.ok) {
          const data = await response.json();
          setComments(data);
          return data;
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        return [];
      }
    },
    [headers],
  );

  const addComment = async (text, taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text, taskId }),
      });
      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => [...prev, newComment]);
        return newComment;
      }
      const err = await response.json();
      return { error: err.message || "Failed to add comment" };
    } catch (error) {
      return { error: error.message || "Failed to add comment" };
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        setComments((prev) =>
          prev.filter((c) => String(c.id) !== String(commentId)),
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete comment:", error);
      return false;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        fetchTasksByProject,
        fetchTasksByAssignee,
        createTask,
        updateTask,
        deleteTask,
        comments,
        fetchComments,
        addComment,
        deleteComment,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
