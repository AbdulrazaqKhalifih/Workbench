import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FolderKanban, Users, CheckSquare, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { useTeams } from "../context/TeamContext";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { getProject, fetchProjects, loading } = useProjects();
  const { getTeam } = useTeams();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const project = getProject(projectId);
  const team = project ? getTeam(project.teamId) : null;

  if (loading && !project) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">Project not found</p>
        <Link
          to="/projects"
          className="mt-2 inline-flex items-center gap-1 text-violet-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-violet-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        {team && (
          <Link
            to={`/teams/${team.id}`}
            className="text-sm text-gray-500 hover:text-violet-600"
          >
            View team
          </Link>
        )}
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-2 max-w-3xl text-gray-500">
              Project workspace for coordinating tasks, updates, and team activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {team && (
              <Link
                to={`/teams/${team.id}`}
                className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-200"
              >
                {team.name}
              </Link>
            )}
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              Project #{project.id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CheckSquare className="h-5 w-5 text-emerald-500" />
            Work Items
          </h2>
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
            Task management will live here once the task API is wired up.
            For now, this page gives the project a dedicated landing view.
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Users className="h-5 w-5 text-violet-500" />
              Team Context
            </h2>
            {team ? (
              <>
                <p className="text-sm font-medium text-gray-900">{team.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Open the team page to manage members and project access.
                </p>
                <Link
                  to={`/teams/${team.id}`}
                  className="mt-4 inline-flex text-sm font-medium text-violet-600 hover:underline"
                >
                  Go to team page
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-500">Team information is unavailable.</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              Notes
            </h2>
            <p className="text-sm text-gray-500">
              You are signed in as {user?.username || user?.email || "the current user"}.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              This is the project landing page. The next step is wiring task, comment,
              and project detail APIs to make this fully interactive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
