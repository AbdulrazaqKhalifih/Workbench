import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListTodo, Calendar, User, FolderKanban, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useProjects } from "../context/ProjectContext";

const STATUS_BADGE = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  DONE: "bg-emerald-50 text-emerald-700",
};

const STATUS_LABEL = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function MyTasksPage() {
  const { user } = useAuth();
  const { tasks, fetchTasksByAssignee, loading } = useTasks();
  const { projects } = useProjects();

  useEffect(() => {
    if (user?.id) {
      fetchTasksByAssignee(user.id);
    }
  }, [user?.id, fetchTasksByAssignee]);

  const getProjectName = (projectId) =>
    projects.find((p) => String(p.id) === String(projectId))?.name || "Unknown";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-base font-semibold text-gray-900">My Tasks</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Tasks assigned to you across all projects.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 rounded-md border border-gray-200 bg-white">
          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <ListTodo className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            No tasks assigned to you
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Tasks assigned to you will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 bg-white divide-y divide-gray-100">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={`/tasks/${task.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[task.status] || "bg-gray-100 text-gray-600"}`}
              >
                {STATUS_LABEL[task.status] || task.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {task.title}
                </p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                  {getProjectName(task.projectId)}
                </p>
              </div>
              {task.dueDate && (
                <span className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                  <Calendar className="h-2.5 w-2.5" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
