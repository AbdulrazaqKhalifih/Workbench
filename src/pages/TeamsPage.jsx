import { Link } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";

export default function TeamsPage() {
  const { user } = useAuth();
  const { teams } = useTeams();

  const userTeams = teams.filter((t) =>
    t.members.some((m) => m.userId === user.id),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your teams and members.
          </p>
        </div>
        <Link
          to="/teams/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Team
        </Link>
      </div>

      {userTeams.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <Users className="h-8 w-8 text-violet-600" />
          </div>
          <p className="text-lg font-medium text-gray-900">No teams yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create your first team to start collaborating.
          </p>
          <Link
            to="/teams/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userTeams.map((team) => {
            const myRole = team.members.find((m) => m.userId === user.id)?.role;
            return (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-violet-200"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-200 transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      myRole === "admin"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {myRole}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {team.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {team.description}
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  {team.members.length} member
                  {team.members.length !== 1 ? "s" : ""}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
