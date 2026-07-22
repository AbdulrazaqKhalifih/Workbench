import { Link } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import RefreshButton from "../components/RefreshButton";

export default function TeamsPage() {
  const { user } = useAuth();
  const { teams, fetchTeams } = useTeams();

  const userTeams = teams.filter((t) =>
    t.members?.some((m) => String(m.userId) === String(user.id)),
  );

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-gray-900">Teams</h1>
          <RefreshButton onClick={fetchTeams} />
          <p className="mt-0.5 text-xs text-gray-500">
            Manage your teams and members.
          </p>
        </div>
        <Link
          to="/teams/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500"
        >
          <Plus className="h-3.5 w-3.5" />
          New Team
        </Link>
      </div>

      {userTeams.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <Users className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">No teams yet</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Create your first team to start collaborating.
          </p>
          <Link
            to="/teams/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Team
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {userTeams.map((team) => {
            const myRole = team.members?.find(
              (m) => String(m.userId) === String(user.id),
            )?.role;
            const isAdmin = String(myRole).toUpperCase() === "ADMIN";
            return (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="group rounded-md border border-gray-200 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-sm"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-500 group-hover:bg-amber-100 transition-colors">
                    <Users className="h-3.5 w-3.5" />
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
                <h3 className="text-xs font-semibold text-gray-900">
                  {team.name}
                </h3>
                <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                  Team workspace
                </p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {team.members?.length || 0} member
                    {(team.members?.length || 0) !== 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
