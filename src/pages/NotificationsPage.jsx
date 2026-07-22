import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  UserCheck,
  UserPlus,
  UserMinus,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const NOTIFICATION_ICONS = {
  TASK_ASSIGNED: UserCheck,
  TEAM_MEMBER_ADDED: UserPlus,
  TEAM_MEMBER_REMOVED: UserMinus,
};

const NOTIFICATION_COLORS = {
  TASK_ASSIGNED: "bg-amber-50 text-amber-600",
  TEAM_MEMBER_ADDED: "bg-emerald-50 text-emerald-600",
  TEAM_MEMBER_REMOVED: "bg-red-50 text-red-500",
};

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);
  const sorted = [...unread, ...read];

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">
            Notifications
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Stay up to date with your team activity.
          </p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <Bell className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            No notifications yet
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            When someone assigns you a task or leaves a comment, you'll see it
            here.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 bg-white divide-y divide-gray-100 stagger-children">
          {sorted.map((notification) => {
            const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
            const colorClass =
              NOTIFICATION_COLORS[notification.type] ||
              "bg-gray-100 text-gray-500";

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  !notification.read ? "bg-amber-50/30" : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${colorClass}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {formatTimeAgo(notification.sentAt)}
                    </span>
                    {notification.taskId && (
                      <Link
                        to={`/tasks/${notification.taskId}`}
                        className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 hover:text-amber-700 hover:underline"
                        onClick={() => {
                          if (!notification.read) markAsRead(notification.id);
                        }}
                      >
                        View task
                        <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="rounded p-0.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
                    title="Mark as read"
                  >
                    <CheckCheck className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
