import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Helper to render with AuthProvider
function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

// Test component that uses auth
function TestAuth() {
  const { user, token, login, register, logout, updateUser, loading } =
    useAuth();
  return (
    <div>
      <span data-testid="user">{user?.username || "null"}</span>
      <span data-testid="token">{token ? "set" : "null"}</span>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <button
        data-testid="btn-login"
        onClick={() => login("test@test.com", "pass123")}
      >
        Login
      </button>
      <button
        data-testid="btn-register"
        onClick={() => register("Test", "test@test.com", "pass123")}
      >
        Register
      </button>
      <button data-testid="btn-logout" onClick={logout}>
        Logout
      </button>
      <button
        data-testid="btn-update"
        onClick={() => updateUser({ username: "NewName" })}
      >
        Update
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders with no user initially", () => {
    renderWithAuth(<TestAuth />);
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("token").textContent).toBe("null");
  });

  it("restores user from localStorage on mount", () => {
    const userData = { id: 1, username: "TestUser", email: "test@test.com" };
    const validPayload = btoa(JSON.stringify({ exp: 9999999999 }));
    localStorage.setItem("accessToken", `header.${validPayload}.sig`);
    localStorage.setItem("user", JSON.stringify(userData));

    renderWithAuth(<TestAuth />);
    expect(screen.getByTestId("user").textContent).toBe("TestUser");
    expect(screen.getByTestId("token").textContent).toBe("set");
  });

  it("does not restore expired token from localStorage", () => {
    const expiredPayload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }),
    );
    localStorage.setItem("accessToken", `header.${expiredPayload}.sig`);
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, username: "Old", email: "o@t.com" }),
    );

    renderWithAuth(<TestAuth />);
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("login sets user and token", async () => {
    const fakeResponse = {
      ok: true,
      json: async () => ({
        accessToken: "new.jwt.token",
        user: { id: 1, username: "LoggedIn", email: "test@test.com" },
      }),
    };
    global.fetch = vi.fn().mockResolvedValue(fakeResponse);

    renderWithAuth(<TestAuth />);
    await act(async () => {
      screen.getByTestId("btn-login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("LoggedIn");
      expect(screen.getByTestId("token").textContent).toBe("set");
    });
    expect(localStorage.getItem("accessToken")).toBe("new.jwt.token");
  });

  it("register sets user and token", async () => {
    const fakeResponse = {
      ok: true,
      json: async () => ({
        accessToken: "reg.jwt.token",
        user: { id: 2, username: "NewUser", email: "new@test.com" },
      }),
    };
    global.fetch = vi.fn().mockResolvedValue(fakeResponse);

    renderWithAuth(<TestAuth />);
    await act(async () => {
      screen.getByTestId("btn-register").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("NewUser");
      expect(screen.getByTestId("token").textContent).toBe("set");
    });
  });

  it("logout clears user and token", async () => {
    const userData = { id: 1, username: "TestUser", email: "t@t.com" };
    const validPayload = btoa(JSON.stringify({ exp: 9999999999 }));
    localStorage.setItem("accessToken", `header.${validPayload}.sig`);
    localStorage.setItem("user", JSON.stringify(userData));

    renderWithAuth(<TestAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("TestUser");
    });

    await act(async () => {
      screen.getByTestId("btn-logout").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("token").textContent).toBe("null");
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("updateUser updates local state and localStorage", async () => {
    const userData = { id: 1, username: "OldName", email: "t@t.com" };
    const payload = btoa(JSON.stringify({ exp: 9999999999 }));
    localStorage.setItem("accessToken", `h.${payload}.s`);
    localStorage.setItem("user", JSON.stringify(userData));
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    renderWithAuth(<TestAuth />);
    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("OldName");
    });

    await act(async () => {
      screen.getByTestId("btn-update").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("NewName");
    });
    const stored = JSON.parse(localStorage.getItem("user"));
    expect(stored.username).toBe("NewName");
  });

  it("login failure does not set user", async () => {
    const fakeResponse = {
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    };
    global.fetch = vi.fn().mockResolvedValue(fakeResponse);

    renderWithAuth(<TestAuth />);
    await act(async () => {
      screen.getByTestId("btn-login").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
  });
});
