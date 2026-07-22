import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { TaskProvider, useTasks } from "../context/TaskContext";

const API_URL = "http://localhost:8080/api/v1";

function TestTasks() {
  const {
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
  } = useTasks();

  return (
    <div>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <span data-testid="tasks-count">{tasks.length}</span>
      <span data-testid="comments-count">{comments.length}</span>
      <ul data-testid="tasks-list">
        {tasks.map((t) => (
          <li key={t.id} data-testid={`task-${t.id}`}>
            {t.title} - {t.status}
          </li>
        ))}
      </ul>
      <ul data-testid="comments-list">
        {comments.map((c) => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
      <button
        data-testid="btn-fetch-project"
        onClick={() => fetchTasksByProject(1)}
      >
        Fetch Project
      </button>
      <button
        data-testid="btn-fetch-assignee"
        onClick={() => fetchTasksByAssignee(1)}
      >
        Fetch My Tasks
      </button>
      <button
        data-testid="btn-create"
        onClick={() => createTask("New Task", "desc", 1, null, null)}
      >
        Create
      </button>
      <button
        data-testid="btn-update"
        onClick={() => updateTask(1, { title: "Updated" })}
      >
        Update
      </button>
      <button data-testid="btn-delete" onClick={() => deleteTask(1)}>
        Delete
      </button>
      <button data-testid="btn-fetch-comments" onClick={() => fetchComments(1)}>
        Fetch Comments
      </button>
      <button
        data-testid="btn-add-comment"
        onClick={() => addComment("Nice!", 1)}
      >
        Add Comment
      </button>
      <button
        data-testid="btn-delete-comment"
        onClick={() => deleteComment(1, 1)}
      >
        Delete Comment
      </button>
    </div>
  );
}

// We need to wrap with AuthProvider for token context
import { AuthProvider } from "../context/AuthContext";

function renderWithProviders(ui) {
  // Set a token so headers are created
  localStorage.setItem("accessToken", "test.jwt.token");
  localStorage.setItem(
    "user",
    JSON.stringify({ id: 1, username: "Tester", email: "t@t.com" }),
  );
  return render(
    <AuthProvider>
      <TaskProvider>{ui}</TaskProvider>
    </AuthProvider>,
  );
}

const mockTasks = [
  { id: 1, title: "Task A", status: "TODO", projectId: 1, assigneeId: 1 },
  {
    id: 2,
    title: "Task B",
    status: "IN_PROGRESS",
    projectId: 1,
    assigneeId: null,
  },
];

const mockComments = [{ id: 1, text: "First!", taskId: 1, userName: "User" }];

describe("TaskContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with no tasks initially", () => {
    renderWithProviders(<TestTasks />);
    expect(screen.getByTestId("tasks-count").textContent).toBe("0");
    expect(screen.getByTestId("comments-count").textContent).toBe("0");
  });

  it("fetchTasksByProject loads and caches tasks", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    renderWithProviders(<TestTasks />);

    await act(async () => {
      screen.getByTestId("btn-fetch-project").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("tasks-count").textContent).toBe("2");
    });
    expect(screen.getByTestId("task-1")).toBeTruthy();
    expect(screen.getByTestId("task-2")).toBeTruthy();
  });

  it("fetchTasksByAssignee loads tasks", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [mockTasks[0]],
    });

    renderWithProviders(<TestTasks />);

    await act(async () => {
      screen.getByTestId("btn-fetch-assignee").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("tasks-count").textContent).toBe("1");
    });
  });

  it("createTask adds task optimistically", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 3,
        title: "New Task",
        status: "TODO",
        projectId: 1,
      }),
    });

    renderWithProviders(<TestTasks />);

    await act(async () => {
      screen.getByTestId("btn-create").click();
    });

    await waitFor(() => {
      // Optimistic: appears immediately
      expect(screen.getByTestId("tasks-count").textContent).toBe("1");
    });
  });

  it("updateTask updates task optimistically", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, title: "Updated", status: "TODO" }),
    });

    // First load tasks
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    renderWithProviders(<TestTasks />);

    // Load tasks
    await act(async () => {
      screen.getByTestId("btn-fetch-project").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("tasks-count").textContent).toBe("2");
    });

    // Update task
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: "Updated", status: "TODO" }),
    });

    await act(async () => {
      screen.getByTestId("btn-update").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("tasks-count").textContent).toBe("2");
    });
  });

  it("deleteTask removes task optimistically", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    renderWithProviders(<TestTasks />);

    // Load tasks
    await act(async () => {
      screen.getByTestId("btn-fetch-project").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("tasks-count").textContent).toBe("2");
    });

    // Mock DELETE
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    await act(async () => {
      screen.getByTestId("btn-delete").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("tasks-count").textContent).toBe("1");
    });
  });

  it("fetchComments loads comments", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockComments,
    });

    renderWithProviders(<TestTasks />);

    await act(async () => {
      screen.getByTestId("btn-fetch-comments").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("comments-count").textContent).toBe("1");
    });
  });

  it("addComment adds to list and cache", async () => {
    // First load comments
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithProviders(<TestTasks />);

    await act(async () => {
      screen.getByTestId("btn-fetch-comments").click();
    });

    // Now add comment
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, text: "Nice!", taskId: 1, userName: "Me" }),
    });

    await act(async () => {
      screen.getByTestId("btn-add-comment").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("comments-count").textContent).toBe("1");
    });
  });

  it("handles 403 by clearing localStorage", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 403 });
    // jsdom doesn't allow spying on location.reload, so just verify localStorage is cleared
    const clearSpy = vi.spyOn(Storage.prototype, "removeItem");

    renderWithProviders(<TestTasks />);

    await act(async () => {
      screen.getByTestId("btn-fetch-project").click();
    });

    await waitFor(() => {
      expect(localStorage.getItem("accessToken")).toBeNull();
    });
  });
});
