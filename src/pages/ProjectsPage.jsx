import { Link } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";
import RefreshButton from "../components/RefreshButton";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { teams } = useTeams();
  const { projects, fetchProjects } = useProjects();

  const userTeamIds = teams
    .filter((t) => t.members?.some((m) => String(m.userId) === String(user.id)))
    .map((t) => t.id);

  const userProjects = projects.filter((p) =>
    userTeamIds.map(String).includes(String(p.teamId)),
  );

  const getTeamName = (teamId) =>
    teams.find((t) => String(t.id) === String(teamId))?.name || "Unknown";

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-gray-900">Projects</h1>
          <RefreshButton onClick={fetchProjects} />
          <p className="mt-0.5 text-xs text-gray-500">
            View all projects across your teams.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Link>
      </div>

      {userProjects.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <FolderKanban className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">No projects yet</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Create a project within one of your teams.
          </p>
          <Link
            to="/projects/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {userProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group rounded-md border border-gray-200 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-sm"
            >
              <div className="mb-2.5 flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-500 group-hover:bg-amber-100 transition-colors">
                <FolderKanban className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-gray-900">
                {project.name}
              </h3>
              <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                {project.description || "No description"}
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {getTeamName(project.teamId)}
                </span>
                <span className="text-[10px] text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
