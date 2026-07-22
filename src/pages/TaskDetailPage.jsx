import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Trash2,
  MessageSquare,
  Send,
  Clock,
  Loader2,
  Edit2,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useProjects } from "../context/ProjectContext";
import { useTeams } from "../context/TeamContext";
import RefreshButton from "../components/RefreshButton";

const STATUS_OPTIONS = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DONE", label: "Done" },
];

const STATUS_BADGE = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  DONE: "bg-emerald-50 text-emerald-700",
};

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    tasks,
    fetchTasksByProject,
    updateTask,
    deleteTask,
    comments,
    fetchComments,
    addComment,
    deleteComment,
  } = useTasks();
  const { getProject } = useProjects();
  const { getTeam } = useTeams();

  const [commentText, setCommentText] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentsLoadedFor, setCommentsLoadedFor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAssigneeId, setEditAssigneeId] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const openEdit = () => {
    setEditTitle(task?.title || "");
    setEditDescription(task?.description || "");
    setEditAssigneeId(task?.assigneeId || "");
    setEditDueDate(
      task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    );
    setEditing(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    await updateTask(taskId, {
      title: editTitle,
      description: editDescription,
      assigneeId: editAssigneeId || null,
      dueDate: editDueDate || null,
    });
    setEditing(false);
  };

  // Find task from context
  const task = tasks.find((t) => String(t.id) === String(taskId));

  useEffect(() => {
    if (task?.projectId) {
      fetchTasksByProject(task.projectId);
    }
  }, [task?.projectId, fetchTasksByProject]);

  // Fetch comments for this task, track which task they belong to
  useEffect(() => {
    setCommentsLoadedFor(null); // clear immediately to prevent stale render
    fetchComments(taskId).then(() => setCommentsLoadedFor(taskId));
  }, [taskId, fetchComments]);

  const project = task ? getProject(task.projectId) : null;
  const team = project ? getTeam(project.teamId) : null;
  const teamMembers = team?.members || [];

  const assigneeName =
    teamMembers.find((m) => String(m.userId) === String(task?.assigneeId))
      ?.userName || task?.assigneeName;

  const isAdmin = team?.members?.some(
    (m) =>
      String(m.userId) === String(user.id) &&
      String(m.role).toUpperCase() === "ADMIN",
  );

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    await updateTask(taskId, { status: newStatus });
    setStatusUpdating(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task permanently?")) return;
    setDeleting(true);
    const success = await deleteTask(taskId);
    setDeleting(false);
    if (success) {
      navigate(`/projects/${task.projectId}`);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(commentText.trim(), taskId);
    setCommentText("");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!task) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm text-gray-500">Task not found</p>
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

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-amber-600 cursor-pointer"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Task Header */}
      <div className="rounded-md border border-gray-200 bg-white p-5 mb-4">
        {editing ? (
          <form onSubmit={handleEditSave} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Assignee
                </label>
                {isAdmin ? (
                  <select
                    value={editAssigneeId}
                    onChange={(e) => setEditAssigneeId(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.userName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={editAssigneeId}
                    onChange={(e) => setEditAssigneeId(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    <option value={user.id}>{user.username} (me)</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
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
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-sm font-semibold text-gray-900">
                  {task.title}
                </h1>
                {task.description && (
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                  Status
                </span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdating}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium border-0 cursor-pointer focus:ring-1 focus:ring-amber-200 ${STATUS_BADGE[task.status] || "bg-gray-100 text-gray-600"}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-[11px] text-gray-600">
                  {assigneeName || "Unassigned"}
                </span>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-[11px] text-gray-600">
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              )}

              {/* Created */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-[11px] text-gray-500">
                  Created {formatDateTime(task.createdAt)}
                </span>
              </div>
            </div>

            {/* Project/team context */}
            <div className="mt-3 flex items-center gap-2">
              {project && (
                <Link
                  to={`/projects/${project.id}`}
                  className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200"
                >
                  {project.name}
                </Link>
              )}
              {team && (
                <span className="text-[10px] text-gray-400">{team.name}</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Comments Section */}
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
            <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
            Comments
            <RefreshButton
              onClick={() => fetchComments(taskId)}
              size="xs"
            />{" "}
            {commentsLoadedFor === taskId ? `(${comments.length})` : ""}
          </h2>
        </div>

        {/* Comment list */}
        <div className="px-5 py-3 space-y-3 max-h-80 overflow-y-auto">
          {commentsLoadedFor !== taskId ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 text-gray-300 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-[11px] text-gray-400 text-center py-4">
              No comments yet. Start the discussion.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-white flex-shrink-0 mt-0.5">
                  {(comment.userName || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gray-900">
                      {comment.userName}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-600 leading-relaxed">
                    {comment.text}
                  </p>
                  {String(comment.userId) === String(user.id) && (
                    <button
                      onClick={() => deleteComment(comment.id, taskId)}
                      className="mt-0.5 text-[9px] text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add comment */}
        <form
          onSubmit={handleAddComment}
          className="px-5 py-3 border-t border-gray-100"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="h-3 w-3" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
