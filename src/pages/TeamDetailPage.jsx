import { useState, useEffect } from "react";
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
        <Link
          to="/teams"
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Teams
        </Link>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">{displayedTeam.name}</h1>
          <p className="mt-0.5 text-xs text-gray-500">Team workspace</p>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize ${
            isAdmin
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {String(myRole || "member").toLowerCase()}
        </span>
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

          {addError && <p className="mb-2 text-[11px] text-red-600">{addError}</p>}
          {addSuccess && (
            <p className="mb-2 text-[11px] text-emerald-600">{addSuccess}</p>
          )}

          <div className="space-y-1.5">
            {memberDetails.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between rounded-md border border-gray-100 p-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">
                    {(m.userName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      {m.userName || "Unknown"}
                    </p>
                    <p className="text-[10px] text-gray-400">{m.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                    String(m.role).toUpperCase() === "ADMIN"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {String(m.role).toLowerCase()}
                </span>
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
                <p className="mt-0.5 text-[11px]">Create a project to get started.</p>
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
                  <p className="text-xs font-medium text-gray-900">
                    {project.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
