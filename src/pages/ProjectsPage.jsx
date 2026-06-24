import { Link, useNavigate } from "react-router-dom";
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
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          to="/projects/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {userProjects.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
          <p className="mb-2 text-5xl">📁</p>
          <p className="text-lg font-medium text-gray-900">No projects yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create a project within one of your teams.
          </p>
          <Link
            to="/projects/new"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="mb-3 inline-block text-3xl">📁</span>
              <h3 className="text-lg font-semibold text-gray-900">
                {project.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {project.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
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
