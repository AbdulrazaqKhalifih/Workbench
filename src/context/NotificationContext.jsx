import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }),
    [token],
  );

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers,
      });
      if (response.status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.reload();
        return [];
      }
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        return data;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [headers]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/unread-count`,
        {
          headers,
        },
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount ?? 0);
        return data.unreadCount ?? 0;
      }
      return 0;
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      return 0;
    }
  }, [headers]);

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}/read`,
          { method: "PATCH", headers },
        );
        if (response.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              String(n.id) === String(notificationId)
                ? { ...n, read: true, readAt: new Date().toISOString() }
                : n,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        return false;
      }
    },
    [headers],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers,
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            read: true,
            readAt: new Date().toISOString(),
          })),
        );
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      return false;
    }
  }, [headers]);

  // Fetch unread count on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchUnreadCount();
    }
  }, [token, fetchUnreadCount]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
}
