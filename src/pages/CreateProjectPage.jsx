import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";

export default function CreateProjectPage() {
  const [name, setName] = useState("");
  const [searchParams] = useSearchParams();
  const preselectedTeamId = searchParams.get("teamId") || "";
  const [selectedTeamId, setSelectedTeamId] = useState(preselectedTeamId);

  const { user } = useAuth();
  const { teams } = useTeams();
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const userTeams = teams.filter((t) => {
    const member = t.members?.find((m) => String(m.userId) === String(user.id));
    return Boolean(member);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    const project = await createProject(name, selectedTeamId);
    if (project?.id) {
      navigate(`/projects/${project.id}`);
    }
  };

  return (
    <div className="px-6 py-8 max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        <ArrowLeft className="h-3 w-3" />
        Back
      </button>

      <h1 className="text-base font-semibold text-gray-900 mb-4">
        Create New Project
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-md border border-gray-200 bg-white p-5"
      >
        <div>
          <label
            htmlFor="team"
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Team
          </label>
          <select
            id="team"
            required
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
          >
            <option value="">Select a team...</option>
            {userTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {userTeams.length === 0 && (
            <p className="mt-1 text-[10px] text-gray-500">
              You need to belong to at least one team to create a project.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Project Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
            placeholder="e.g., Sprint 1"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={userTeams.length === 0}
            className="rounded-md bg-amber-400 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-200 focus:outline-none cursor-pointer"
          >
            Create Project
          </button>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
