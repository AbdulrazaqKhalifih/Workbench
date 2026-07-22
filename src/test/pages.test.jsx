import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import TeamsPage from "../pages/TeamsPage";
import ProjectsPage from "../pages/ProjectsPage";
import NotificationsPage from "../pages/NotificationsPage";
import MyTasksPage from "../pages/MyTasksPage";
import RefreshButton from "../components/RefreshButton";

// --- Mock contexts ---
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: "TestUser",
      name: "TestUser",
      email: "test@test.com",
    },
    token: "fake-token",
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }) => <>{children}</>,
}));

vi.mock("../context/TeamContext", () => ({
  useTeams: () => ({
    teams: [
      {
        id: 1,
        name: "Team Alpha",
        members: [
          {
            userId: 1,
            userName: "TestUser",
            email: "test@test.com",
            role: "ADMIN",
          },
          { userId: 2, userName: "Bob", email: "bob@test.com", role: "MEMBER" },
        ],
      },
      {
        id: 2,
        name: "Team Beta",
        members: [
          {
            userId: 1,
            userName: "TestUser",
            email: "test@test.com",
            role: "MEMBER",
          },
        ],
      },
    ],
    fetchTeams: vi.fn(),
    createTeam: vi.fn(),
    getTeam: (id) =>
      id === "1"
        ? {
            id: 1,
            name: "Team Alpha",
            members: [
              {
                userId: 1,
                userName: "TestUser",
                email: "test@test.com",
                role: "ADMIN",
              },
            ],
          }
        : null,
    addMember: vi.fn(),
    removeMember: vi.fn(),
    deleteTeam: vi.fn(),
    updateTeam: vi.fn(),
    getUserRole: () => "ADMIN",
    fetchTeamMembers: vi.fn(),
    loading: false,
  }),
}));

vi.mock("../context/ProjectContext", () => ({
  useProjects: () => ({
    projects: [
      { id: 1, name: "Project X", teamId: 1 },
      { id: 2, name: "Project Y", teamId: 2 },
    ],
    fetchProjects: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
    updateProject: vi.fn(),
    getProject: (id) =>
      id === "1" ? { id: 1, name: "Project X", teamId: 1 } : null,
    getProjectsByTeam: (teamId) =>
      teamId === "1" ? [{ id: 1, name: "Project X", teamId: 1 }] : [],
    loading: false,
  }),
}));

vi.mock("../context/TaskContext", () => ({
  useTasks: () => ({
    tasks: [
      { id: 1, title: "Task 1", status: "TODO", projectId: 1, assigneeId: 1 },
      {
        id: 2,
        title: "Task 2",
        status: "IN_PROGRESS",
        projectId: 1,
        assigneeId: 1,
      },
      {
        id: 3,
        title: "Task 3",
        status: "DONE",
        projectId: 1,
        assigneeId: null,
      },
    ],
    comments: [
      {
        id: 1,
        text: "Great work!",
        taskId: 1,
        userName: "Bob",
        userId: 2,
        createdAt: "2026-07-22T10:00:00",
      },
    ],
    fetchTasksByProject: vi.fn(),
    fetchTasksByAssignee: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    fetchComments: vi.fn(),
    addComment: vi.fn(),
    deleteComment: vi.fn(),
    loading: false,
  }),
}));

vi.mock("../context/NotificationContext", () => ({
  useNotifications: () => ({
    notifications: [
      {
        id: 1,
        message: "Assigned to task: Task 1",
        type: "TASK_ASSIGNED",
        read: false,
        sentAt: "2026-07-22T09:00:00",
        taskId: 1,
      },
      {
        id: 2,
        message: "Added to team: Team Alpha",
        type: "TEAM_MEMBER_ADDED",
        read: true,
        sentAt: "2026-07-21T15:00:00",
      },
    ],
    unreadCount: 1,
    fetchNotifications: vi.fn(),
    fetchUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    loading: false,
  }),
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Pages", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("LoginPage", () => {
    it("renders login form", () => {
      renderWithRouter(<LoginPage />);
      expect(screen.getByText("Workbench")).toBeTruthy();
      expect(screen.getByText("Sign in to your account")).toBeTruthy();
      expect(screen.getByText("Sign In")).toBeTruthy();
      expect(screen.getByText(/Register/)).toBeTruthy();
    });

    it("has email and password inputs", () => {
      renderWithRouter(<LoginPage />);
      expect(screen.getByLabelText("Email")).toBeTruthy();
      expect(screen.getByLabelText("Password")).toBeTruthy();
    });
  });

  describe("RegisterPage", () => {
    it("renders registration form", () => {
      renderWithRouter(<RegisterPage />);
      expect(screen.getByText("Create your account")).toBeTruthy();
      expect(screen.getByText("Create Account")).toBeTruthy();
      expect(screen.getByLabelText("Full Name")).toBeTruthy();
      expect(screen.getByLabelText("Email")).toBeTruthy();
      expect(screen.getByLabelText("Password")).toBeTruthy();
    });
  });

  describe("DashboardPage", () => {
    it("renders welcome message with username", () => {
      renderWithRouter(<DashboardPage />);
      expect(screen.getByText(/Welcome back/)).toBeTruthy();
      expect(
        screen.getByText((content) => content.includes("Welcome back")),
      ).toBeTruthy();
    });

    it("renders Your Teams section", () => {
      renderWithRouter(<DashboardPage />);
      expect(screen.getByText("Your Teams")).toBeTruthy();
      expect(screen.getByText("Team Alpha")).toBeTruthy();
      expect(screen.getByText("Team Beta")).toBeTruthy();
    });

    it("renders Your Projects section", () => {
      renderWithRouter(<DashboardPage />);
      expect(screen.getByText("Your Projects")).toBeTruthy();
      const projectLinks = screen.getAllByRole("link", { name: /Project/ });
      expect(projectLinks.length).toBeGreaterThan(0);
    });

    it("renders Your Tasks section", () => {
      renderWithRouter(<DashboardPage />);
      expect(screen.getByText("Your Tasks")).toBeTruthy();
    });
  });

  describe("TeamsPage", () => {
    it("renders team list", () => {
      renderWithRouter(<TeamsPage />);
      expect(screen.getByText("Teams")).toBeTruthy();
      expect(screen.getByText("Team Alpha")).toBeTruthy();
      expect(screen.getByText("Team Beta")).toBeTruthy();
    });

    it("shows member count", () => {
      renderWithRouter(<TeamsPage />);
      expect(screen.getByText("2 members")).toBeTruthy();
      expect(screen.getAllByText("1 member").length).toBeGreaterThan(0);
    });
  });

  describe("ProjectsPage", () => {
    it("renders project list", () => {
      renderWithRouter(<ProjectsPage />);
      expect(screen.getByText("Projects")).toBeTruthy();
      expect(screen.getByText("Project X")).toBeTruthy();
      expect(screen.getByText("Project Y")).toBeTruthy();
    });

    it("shows New Project button", () => {
      renderWithRouter(<ProjectsPage />);
      expect(screen.getByText("New Project")).toBeTruthy();
    });
  });

  describe("NotificationsPage", () => {
    it("renders notifications list", () => {
      renderWithRouter(<NotificationsPage />);
      expect(screen.getByText("Notifications")).toBeTruthy();
      expect(screen.getByText(/Assigned to task/)).toBeTruthy();
      expect(screen.getByText(/Added to team/)).toBeTruthy();
    });

    it("shows Mark all as read button for unread", () => {
      renderWithRouter(<NotificationsPage />);
      expect(screen.getByText("Mark all as read")).toBeTruthy();
    });
  });

  describe("MyTasksPage", () => {
    it("renders My Tasks heading", () => {
      renderWithRouter(<MyTasksPage />);
      expect(screen.getByText("My Tasks")).toBeTruthy();
    });

    it("renders task list", () => {
      renderWithRouter(<MyTasksPage />);
      expect(screen.getByText("Task 1")).toBeTruthy();
      expect(screen.getByText("Task 2")).toBeTruthy();
    });
  });

  describe("RefreshButton", () => {
    it("renders and calls onClick", async () => {
      const onClick = vi.fn().mockResolvedValue();
      const { container } = render(<RefreshButton onClick={onClick} />);
      const btn = container.querySelector("button");
      expect(btn).toBeTruthy();
      btn.click();
      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
