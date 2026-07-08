import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    <div className="px-6 py-8 max-w-lg mx-auto">
      <Link
        to="/teams"
        className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Teams
      </Link>

      <h1 className="text-base font-semibold text-gray-900 mb-4">
        Create New Team
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-md border border-gray-200 bg-white p-5"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Team Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
            placeholder="e.g., Development Team"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
            placeholder="What is this team working on?"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            className="rounded-md bg-amber-400 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none cursor-pointer"
          >
            Create Team
          </button>
          <button
            type="button"
            onClick={() => navigate("/teams")}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
