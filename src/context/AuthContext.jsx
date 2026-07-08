import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore user from localStorage on mount (skip if token expired)
  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          return;
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        return;
      }
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const register = async (
    name,
    email,
    password,
    confirmPassword = password,
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password,
          confirmPassword,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "Registration failed" };
      }

      const userData = {
        id: data.user?.id,
        username: data.user?.username,
        email: data.user?.email,
      };

      setToken(data.accessToken);
      setUser(userData);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "Login failed" };
      }

      const userData = {
        id: data.user?.id,
        username: data.user?.username,
        email: data.user?.email,
      };

      setToken(data.accessToken);
      setUser(userData);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
