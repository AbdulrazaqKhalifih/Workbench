import { Link } from "react-router-dom";
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
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <Link
          to="/teams/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          + New Team
        </Link>
      </div>

      {userTeams.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
          <p className="mb-2 text-5xl">👥</p>
          <p className="text-lg font-medium text-gray-900">No teams yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create your first team to start collaborating.
          </p>
          <Link
            to="/teams/new"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
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
                className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl">👥</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      myRole === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
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
