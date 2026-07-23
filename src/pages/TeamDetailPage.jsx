import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  FolderKanban,
  Plus,
  ArrowLeft,
  UserPlus,
  X,
  Trash2,
  Edit2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";
import ProjectProgressBar from "../components/ProjectProgressBar";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getTeam,
    addMember,
    removeMember,
    deleteTeam,
    updateTeam,
    getUserRole,
    fetchTeamMembers,
  } = useTeams();
  const { getProjectsByTeam } = useProjects();

  const team = getTeam(teamId);
  const teamMembers = team?.members || [];
  const myRole = getUserRole(teamId, user.id);
  const isAdmin = String(myRole).toUpperCase() === "ADMIN";
  const teamProjects = getProjectsByTeam(teamId);

  const [addEmail, setAddEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);

  useEffect(() => {
    fetchTeamMembers(teamId);
  }, [teamId, fetchTeamMembers]);

  const [remoteTeam, setRemoteTeam] = useState(null);

  useEffect(() => {
    if (team) return;

    const loadTeam = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.ok) {
          setRemoteTeam(await response.json());
        }
      } catch (error) {
        console.error("Failed to load team details:", error);
      }
    };

    loadTeam();
  }, [team, teamId]);

  const displayedTeam = team || remoteTeam;

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    const response = await fetch(
      `${API_BASE_URL}/users/by-email?email=${encodeURIComponent(addEmail)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );

    if (!response.ok) {
      setAddError("No user found with that email");
      return;
    }

    const foundUser = await response.json();
    const alreadyMember = teamMembers.some(
      (m) => String(m.userId) === String(foundUser.id),
    );
    if (alreadyMember) {
      setAddError("User is already a member of this team");
      return;
    }

    await addMember(teamId, foundUser.id, "member");
    setAddSuccess(`Added ${foundUser.username} to the team!`);
    setAddEmail("");
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm("Delete this team permanently? This cannot be undone."))
      return;
    setDeleting(true);
    const success = await deleteTeam(teamId);
    setDeleting(false);
    if (success) {
      navigate("/teams");
    }
  };

  const handleEditTeam = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await updateTeam(teamId, { name: editName });
    setShowEditModal(false);
  };

  const handleRemoveMember = async (userId) => {
    if (
      !window.confirm(
        "Remove this member from the team? They can be re-added later.",
      )
    )
      return;
    setRemovingMember(userId);
    await removeMember(teamId, userId);
    setRemovingMember(null);
  };

  if (!displayedTeam) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm text-gray-500">Team not found</p>
        <Link
          to="/teams"
          className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Teams
        </Link>
      </div>
    );
  }

  const memberDetails = teamMembers;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>
      </div>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {displayedTeam.name}
            </h1>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditName(displayedTeam.name);
                  setShowEditModal(true);
                }}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
                title="Edit team name"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">Team workspace</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize ${
              isAdmin
                ? "bg-amber-50 text-amber-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {String(myRole || "member").toLowerCase()}
          </span>
          {isAdmin && (
            <button
              onClick={handleDeleteTeam}
              disabled={deleting}
              className="rounded p-1 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
              title="Delete team"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Members section */}
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-900">
            <Users className="h-3.5 w-3.5 text-amber-500" />
            Members ({memberDetails.length})
          </h2>

          {isAdmin && (
            <form onSubmit={handleAddMember} className="mb-3 flex gap-1.5">
              <input
                type="email"
                required
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="Enter email to add..."
                className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-amber-500 cursor-pointer"
              >
                <UserPlus className="h-3 w-3" />
                Add
              </button>
            </form>
          )}

          {addError && (
            <p className="mb-2 text-[11px] text-red-600">{addError}</p>
          )}
          {addSuccess && (
            <p className="mb-2 text-[11px] text-emerald-600">{addSuccess}</p>
          )}

          <div className="space-y-1.5">
            {memberDetails.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between rounded-md border border-gray-100 p-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white flex-shrink-0">
                    {(m.userName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {m.userName || "Unknown"}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {m.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                      String(m.role).toUpperCase() === "ADMIN"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {String(m.role).toLowerCase()}
                  </span>
                  {isAdmin && String(m.userId) !== String(user.id) && (
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      disabled={removingMember === m.userId}
                      className="rounded p-0.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                      title="Remove member"
                    >
                      {removingMember === m.userId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects section */}
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
              <FolderKanban className="h-3.5 w-3.5 text-amber-500" />
              Projects ({teamProjects.length})
            </h2>
            {isAdmin && (
              <Link
                to={`/projects/new?teamId=${displayedTeam.id}`}
                className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-amber-500"
              >
                <Plus className="h-3 w-3" />
                New
              </Link>
            )}
          </div>

          {teamProjects.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              <FolderKanban className="mx-auto mb-1.5 h-5 w-5 text-gray-300" />
              <p className="text-xs">No projects yet.</p>
              {isAdmin && (
                <p className="mt-0.5 text-[11px]">
                  Create a project to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {teamProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block rounded-md border border-gray-100 p-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-900">
                      {project.name}
                    </p>
                    <ProjectProgressBar
                      completed={project.completedTaskCount}
                      total={project.totalTaskCount}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Team Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
          <div
            className="fixed inset-0 bg-black/40 animate-fade-in"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-md border border-gray-200 bg-white shadow-lg animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-xs font-semibold text-gray-900">
                Edit Team Name
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <form onSubmit={handleEditTeam} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                  placeholder="Enter team name"
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
