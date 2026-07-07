import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";

export default function CreateProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [searchParams] = useSearchParams();
  const preselectedTeamId = searchParams.get("teamId") || "";
  const [selectedTeamId, setSelectedTeamId] = useState(preselectedTeamId);

  const { user } = useAuth();
  const { teams } = useTeams();
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const userTeams = teams.filter((t) => {
    const member = t.members?.find(
      (m) => String(m.userId) === String(user.id),
    );
    return Boolean(member);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    const project = await createProject(name, description, selectedTeamId);
    if (project?.id) {
      navigate(`/projects/${project.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Create New Project
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label
            htmlFor="team"
            className="block text-sm font-medium text-gray-700"
          >
            Team
          </label>
          <select
            id="team"
            required
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
          >
            <option value="">Select a team...</option>
            {userTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {userTeams.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              You need to belong to at least one team to create a project.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Project Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
            placeholder="e.g., Sprint 1"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
            placeholder="What is this project about?"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={userTeams.length === 0}
            className="rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-violet-200 focus:outline-none cursor-pointer"
          >
            Create Project
          </button>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
