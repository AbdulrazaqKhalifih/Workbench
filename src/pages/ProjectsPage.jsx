import { Link } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { teams } = useTeams();
  const { projects } = useProjects();

  const userTeamIds = teams
    .filter((t) => t.members.some((m) => m.userId === user.id))
    .map((t) => t.id);

  const userProjects = projects.filter((p) => userTeamIds.includes(p.teamId));

  const getTeamName = (teamId) =>
    teams.find((t) => t.id === teamId)?.name || "Unknown";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            View all projects across your teams.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {userProjects.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <FolderKanban className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-lg font-medium text-gray-900">No projects yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create a project within one of your teams.
          </p>
          <Link
            to="/projects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-amber-200"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
                <FolderKanban className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {project.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {project.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                  {getTeamName(project.teamId)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
