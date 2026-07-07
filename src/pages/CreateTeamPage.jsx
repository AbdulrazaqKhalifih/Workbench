import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";

export default function CreateTeamPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();
  const { createTeam } = useTeams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const team = await createTeam(name, description, user.id);
    if (team?.id) {
      navigate(`/teams/${team.id}`);
    } else {
      navigate("/teams");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Team</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Team Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
            placeholder="e.g., Development Team"
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
            placeholder="What is this team working on?"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:ring-2 focus:ring-violet-200 focus:outline-none cursor-pointer"
          >
            Create Team
          </button>
          <button
            type="button"
            onClick={() => navigate("/teams")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
