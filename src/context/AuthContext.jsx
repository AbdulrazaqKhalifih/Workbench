import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Mock users for the starter version
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@workbench.com",
    password: "password123",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(MOCK_USERS);

  const register = (name, email, password) => {
    const exists = users.find((u) => u.email === email);
    if (exists) return { success: false, error: "Email already registered" };
    const newUser = { id: String(Date.now()), name, email, password };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const login = (email, password) => {
    const found = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!found) return { success: false, error: "Invalid email or password" };
    setUser(found);
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
