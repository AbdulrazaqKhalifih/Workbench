import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { teams } = useTeams();
  const { projects } = useProjects();

  const userTeams = teams.filter((t) =>
    t.members.some((m) => m.userId === user.id),
  );
  const userProjects = projects.filter((p) =>
    userTeams.some((t) => t.id === p.teamId),
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Welcome, {user?.name} 👋
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Teams card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👥</span>
            <div>
              <p className="text-sm text-gray-500">Your Teams</p>
              <p className="text-2xl font-bold text-gray-900">
                {userTeams.length}
              </p>
            </div>
          </div>
        </div>

        {/* Projects card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📁</span>
            <div>
              <p className="text-sm text-gray-500">Your Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {userProjects.length}
              </p>
            </div>
          </div>
        </div>

        {/* Members card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👤</span>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-2xl font-bold text-gray-900">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick overview */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Overview
        </h2>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {userTeams.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p className="mb-2 text-4xl">🚀</p>
              <p className="font-medium">You're not part of any team yet.</p>
              <p className="mt-1 text-sm">
                Create a team in the Teams section to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{team.name}</p>
                    <p className="text-sm text-gray-500">{team.description}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    {team.members.length} member
                    {team.members.length !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
