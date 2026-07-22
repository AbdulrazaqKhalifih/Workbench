import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ListTodo,
  Bell,
  Settings,
  Wrench,
  LogOut,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/teams", label: "Teams", icon: Users },
  { path: "/projects", label: "Projects", icon: FolderKanban },
  { path: "/my-tasks", label: "My Tasks", icon: ListTodo },
  { path: "/notifications", label: "Notifications", icon: Bell },
];

const bottomNavItems = [
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-white text-gray-700 border-r border-gray-200 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-gray-100 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-400">
            <Wrench className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-800">
            Workbench
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/teams" &&
                location.pathname.startsWith("/teams")) ||
              (item.path === "/projects" &&
                (location.pathname.startsWith("/projects") ||
                  location.pathname.startsWith("/tasks"))) ||
              (item.path === "/my-tasks" &&
                location.pathname.startsWith("/my-tasks")) ||
              (item.path === "/notifications" &&
                location.pathname.startsWith("/notifications"));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="flex-1">{item.label}</span>
                {item.path === "/notifications" && unreadCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-white leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Bottom nav */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 px-3 py-3">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer text-left"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
              <ChevronDown
                className={`h-3 w-3 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-400">
              <Wrench className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">Workbench</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
