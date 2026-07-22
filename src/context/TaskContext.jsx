import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

const TaskContext = createContext(null);
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const tasksCache = useRef({});
  const commentsCache = useRef({});
  const { token } = useAuth();

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token],
  );

  const cacheAndSet = (cacheKey, data) => {
    tasksCache.current[cacheKey] = data;
    setTasks(data);
  };

  const fetchTasksByProject = useCallback(
    async (projectId) => {
      const cacheKey = `project:${projectId}`;
      if (tasksCache.current[cacheKey]) {
        setTasks(tasksCache.current[cacheKey]);
        fetch(`${API_BASE_URL}/tasks/project/${projectId}`, { headers })
          .then((r) => r.ok && r.json())
          .then((data) => {
            if (data) cacheAndSet(cacheKey, data);
          })
          .catch(() => {});
        return tasksCache.current[cacheKey];
      }

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
          cacheAndSet(cacheKey, data);
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
      const cacheKey = `assignee:${assigneeId}`;
      if (tasksCache.current[cacheKey]) {
        setTasks(tasksCache.current[cacheKey]);
        fetch(`${API_BASE_URL}/tasks/assignee/${assigneeId}`, { headers })
          .then((r) => r.ok && r.json())
          .then((data) => {
            if (data) cacheAndSet(cacheKey, data);
          })
          .catch(() => {});
        return tasksCache.current[cacheKey];
      }

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
          cacheAndSet(cacheKey, data);
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
    // Optimistic: add a temp task immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      title,
      description: description || "",
      projectId: Number(projectId),
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      status: "TODO",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, optimisticTask]);

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
        setTasks((prev) =>
          prev.map((t) => (String(t.id) === tempId ? newTask : t)),
        );
        return newTask;
      }
      // API failed - remove optimistic task
      setTasks((prev) => prev.filter((t) => String(t.id) !== tempId));
      try {
        const err = await response.json();
        return { error: err.message || err.error || "Failed to create task" };
      } catch {
        return { error: "Failed to create task" };
      }
    } catch (error) {
      setTasks((prev) => prev.filter((t) => String(t.id) !== tempId));
      return { error: error.message || "Failed to create task" };
    }
  };

  const updateTask = async (taskId, updates) => {
    // Optimistic: update immediately
    setTasks((prev) =>
      prev.map((t) =>
        String(t.id) === String(taskId) ? { ...t, ...updates } : t,
      ),
    );

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
    // Optimistic: remove immediately
    const deleted = [];
    setTasks((prev) => {
      const removed = prev.filter((t) => String(t.id) === String(taskId));
      deleted.push(...removed);
      return prev.filter((t) => String(t.id) !== String(taskId));
    });

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        return true;
      }
      // API failed - restore
      setTasks((prev) => [...prev, ...deleted]);
      return false;
    } catch (error) {
      setTasks((prev) => [...prev, ...deleted]);
      console.error("Failed to delete task:", error);
      return false;
    }
  };

  // --- Comments ---
  const fetchComments = useCallback(
    async (taskId) => {
      const cacheKey = String(taskId);
      if (commentsCache.current[cacheKey]) {
        setComments(commentsCache.current[cacheKey]);
        fetch(`${API_BASE_URL}/comments/task/${taskId}`, { headers })
          .then((r) => r.ok && r.json())
          .then((data) => {
            if (data) {
              commentsCache.current[cacheKey] = data;
              setComments(data);
            }
          })
          .catch(() => {});
        return commentsCache.current[cacheKey];
      }

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
          commentsCache.current[cacheKey] = data;
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
        const cacheKey = String(taskId);
        if (commentsCache.current[cacheKey]) {
          commentsCache.current[cacheKey] = [
            ...commentsCache.current[cacheKey],
            newComment,
          ];
        }
        return newComment;
      }
      const err = await response.json();
      return { error: err.message || "Failed to add comment" };
    } catch (error) {
      return { error: error.message || "Failed to add comment" };
    }
  };

  const deleteComment = async (commentId, taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        setComments((prev) =>
          prev.filter((c) => String(c.id) !== String(commentId)),
        );
        if (taskId) {
          const cacheKey = String(taskId);
          if (commentsCache.current[cacheKey]) {
            commentsCache.current[cacheKey] = commentsCache.current[
              cacheKey
            ].filter((c) => String(c.id) !== String(commentId));
          }
        }
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
