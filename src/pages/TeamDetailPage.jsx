import { useState } from "react";
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, FolderKanban, Plus, ArrowLeft, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const { user } = useAuth();
  const { getTeam, addMember, getUserRole, fetchTeamMembers } = useTeams();
  const { getProjectsByTeam } = useProjects();

  const team = getTeam(teamId);
  const teamMembers = team?.members || [];
  const myRole = getUserRole(teamId, user.id);
  const isAdmin = String(myRole).toUpperCase() === "ADMIN";
  const teamProjects = getProjectsByTeam(teamId);

  const [addEmail, setAddEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => {
    fetchTeamMembers(teamId);
  }, [teamId, fetchTeamMembers]);

  const [remoteTeam, setRemoteTeam] = useState(null);

  useEffect(() => {
    if (team) return;

    const loadTeam = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/teams/${teamId}`, {
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
      `http://localhost:8080/api/v1/users/by-email?email=${encodeURIComponent(addEmail)}`,
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

  if (!displayedTeam) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">Team not found</p>
        <Link
          to="/teams"
          className="mt-2 inline-flex items-center gap-1 text-violet-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>
      </div>
    );
  }

  const memberDetails = teamMembers;

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/teams"
          className="inline-flex items-center gap-1 text-sm text-violet-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{displayedTeam.name}</h1>
          <p className="mt-1 text-gray-500">Team workspace</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
            isAdmin
              ? "bg-violet-100 text-violet-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {String(myRole || "member").toLowerCase()}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Members section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 text-violet-500" />
            Members ({memberDetails.length})
          </h2>

          {isAdmin && (
            <form onSubmit={handleAddMember} className="mb-4 flex gap-2">
              <input
                type="email"
                required
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="Enter email to add..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Add
              </button>
            </form>
          )}

          {addError && <p className="mb-3 text-sm text-red-600">{addError}</p>}
          {addSuccess && (
            <p className="mb-3 text-sm text-emerald-600">{addSuccess}</p>
          )}

          <div className="space-y-3">
            {memberDetails.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                    {(m.userName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.userName || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    String(m.role).toUpperCase() === "ADMIN"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {String(m.role).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FolderKanban className="h-5 w-5 text-amber-500" />
              Projects ({teamProjects.length})
            </h2>
            {isAdmin && (
              <Link
                to={`/projects/new?teamId=${displayedTeam.id}`}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            )}
          </div>

          {teamProjects.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <FolderKanban className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm">No projects yet.</p>
              {isAdmin && (
                <p className="mt-1 text-xs">Create a project to get started.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {teamProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <Link
                    to={`/projects/${project.id}`}
                    className="font-medium text-gray-900 hover:text-violet-600"
                  >
                    {project.name}
                  </Link>
                  <p className="text-sm text-gray-500">{project.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
