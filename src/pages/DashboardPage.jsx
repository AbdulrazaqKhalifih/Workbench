import { Link } from "react-router-dom";
import { Users, FolderKanban, ListTodo, Rocket } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { teams } = useTeams();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const userTeams = teams.filter((t) =>
    t.members?.some((m) => String(m.userId) === String(user.id)),
  );
  const userProjects = projects.filter((p) =>
    userTeams.some((t) => String(t.id) === String(p.teamId)),
  );

  const totalTasks = tasks.length;

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Here's what's happening across your workspace.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-50">
              <Users className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Teams</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">{userTeams.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-50">
              <FolderKanban className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Projects</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">{userProjects.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-50">
              <ListTodo className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Active Tasks</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">{totalTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick overview */}
      <div>
        <h2 className="mb-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Your Teams
        </h2>
        <div className="rounded-md border border-gray-200 bg-white">
          {userTeams.length === 0 ? (
            <div className="py-10 text-center">
              <Rocket className="mx-auto mb-2 h-6 w-6 text-gray-300" />
              <p className="text-xs font-medium text-gray-900">
                You're not part of any team yet.
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Create a team in the Teams section to get started!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userTeams.map((team) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100">
                      <Users className="h-3 w-3 text-gray-500" />
                    </div>
                    <p className="text-xs font-medium text-gray-900">{team.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[10px] text-amber-500">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
