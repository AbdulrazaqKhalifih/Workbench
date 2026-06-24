import { Users, FolderKanban, User, Rocket } from "lucide-react";
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening across your workspace.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Teams card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-lg shadow-violet-200">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Your Teams</p>
              <p className="text-3xl font-bold">{userTeams.length}</p>
            </div>
          </div>
        </div>

        {/* Projects card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white shadow-lg shadow-amber-200">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Your Projects</p>
              <p className="text-3xl font-bold">{userProjects.length}</p>
            </div>
          </div>
        </div>

        {/* Role card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-6 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Your Role</p>
              <p className="text-3xl font-bold capitalize">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick overview */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Overview
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {userTeams.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Rocket className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-900">
                You're not part of any team yet.
              </p>
              <p className="mt-1 text-sm">
                Create a team in the Teams section to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{team.name}</p>
                    <p className="text-sm text-gray-500">{team.description}</p>
                  </div>
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
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
