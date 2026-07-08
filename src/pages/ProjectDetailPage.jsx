import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderKanban,
  Plus,
  Calendar,
  User,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { useTeams } from "../context/TeamContext";
import { useTasks } from "../context/TaskContext";

const STATUS_COLUMNS = [
  { key: "TODO", label: "To Do", color: "bg-gray-100 text-gray-700" },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-amber-100 text-amber-700",
  },
  { key: "DONE", label: "Done", color: "bg-emerald-100 text-emerald-700" },
];

const STATUS_BADGE = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  DONE: "bg-emerald-50 text-emerald-700",
};

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { getProject, loading: projectLoading } = useProjects();
  const { getTeam } = useTeams();
  const {
    tasks,
    loading: tasksLoading,
    fetchTasksByProject,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    dueDate: "",
  });
  const [editTask, setEditTask] = useState(null);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchTasksByProject(projectId);
    }
  }, [projectId, fetchTasksByProject]);

  const project = getProject(projectId);
  const team = project ? getTeam(project.teamId) : null;
  const isAdmin = team?.members?.some(
    (m) =>
      String(m.userId) === String(user.id) &&
      String(m.role).toUpperCase() === "ADMIN",
  );

  const getTasksByStatus = (status) =>
    tasks.filter((t) => String(t.status) === status);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!newTask.title.trim()) {
      setCreateError("Title is required");
      return;
    }
    const result = await createTask(
      newTask.title,
      newTask.description,
      projectId,
      newTask.assigneeId || null,
      newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
    );
    if (result?.error) {
      setCreateError(result.error);
    } else {
      setShowCreateModal(false);
      setNewTask({ title: "", description: "", assigneeId: "", dueDate: "" });
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(taskId);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!editTask.title.trim()) return;
    const updates = { title: editTask.title };
    if (editTask.description !== undefined)
      updates.description = editTask.description;
    await updateTask(editTask.id, updates);
    setEditTask(null);
  };

  if (projectLoading && !project) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm text-gray-500">Project not found</p>
        <Link
          to="/projects"
          className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const teamMembers = team?.members || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Projects
        </Link>
        {team && (
          <Link
            to={`/teams/${team.id}`}
            className="text-[11px] text-gray-500 hover:text-amber-600"
          >
            {team.name}
          </Link>
        )}
      </div>

      {/* Project Info */}
      <div className="mb-5 rounded-md border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-50 text-amber-500 flex-shrink-0 mt-0.5">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                {project.name}
              </h1>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {project.description || "Project workspace"}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] text-gray-400">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                </span>
                {team && (
                  <span className="text-[10px] text-gray-400">
                    {teamMembers.length} member
                    {teamMembers.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-amber-500 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STATUS_COLUMNS.map((col) => {
          const columnTasks = getTasksByStatus(col.key);
          return (
            <div
              key={col.key}
              className="rounded-md border border-gray-200 bg-gray-50/50"
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${col.color}`}
                  >
                    {col.label}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Task cards */}
              <div className="p-2 space-y-2 min-h-[120px]">
                {tasksLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-4 w-4 text-gray-300 animate-spin" />
                  </div>
                ) : columnTasks.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-[10px] text-gray-400">No tasks</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      teamMembers={teamMembers}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                      onEdit={setEditTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-xs font-semibold text-gray-900">
                Create Task
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-4 space-y-3">
              {createError && (
                <div className="rounded-md bg-red-50 p-2 text-[11px] text-red-600">
                  {createError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                  placeholder="Add a description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Assignee
                  </label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assigneeId: e.target.value })
                    }
                    className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.userName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-amber-400 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-amber-500 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setEditTask(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-xs font-semibold text-gray-900">Edit Task</h2>
              <button
                onClick={() => setEditTask(null)}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <form onSubmit={handleEditTask} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTask.title}
                  onChange={(e) =>
                    setEditTask({ ...editTask, title: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editTask.description || ""}
                  onChange={(e) =>
                    setEditTask({ ...editTask, description: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditTask(null)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-amber-400 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-amber-500 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, teamMembers, onStatusChange, onDelete, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const assigneeName =
    teamMembers?.find((m) => String(m.userId) === String(task.assigneeId))
      ?.userName || task.assigneeName;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white p-2.5 shadow-sm hover:shadow-sm transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => navigate(`/tasks/${task.id}`)}
          className="text-[11px] font-medium text-gray-900 leading-relaxed flex-1 text-left hover:text-amber-600 transition-colors cursor-pointer"
        >
          {task.title}
        </button>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded p-0.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-5 z-20 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-md">
              <div className="px-2 py-1 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Status
              </div>
              {STATUS_COLUMNS.map((col) => (
                <button
                  key={col.key}
                  onClick={() => {
                    onStatusChange(task.id, col.key);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1 text-[11px] hover:bg-gray-50 transition-colors cursor-pointer ${
                    String(task.status) === col.key
                      ? "text-amber-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {col.label}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    onEdit(task);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1 text-[11px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1 text-[11px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="mt-1 text-[10px] text-gray-500 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        {assigneeName && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
            <User className="h-2.5 w-2.5" />
            {assigneeName}
          </span>
        )}
        {task.dueDate && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
