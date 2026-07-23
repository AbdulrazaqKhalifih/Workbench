import { Link } from "react-router-dom";
import {
  Users,
  FolderKanban,
  ListTodo,
  Rocket,
  Calendar,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../context/TeamContext";
import { useProjects } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import ProjectProgressBar from "../components/ProjectProgressBar";

const STATUS_BADGE = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  DONE: "bg-emerald-50 text-emerald-700",
};
const STATUS_LABEL = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

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
  const userTasks = tasks.filter(
    (t) => String(t.assigneeId) === String(user.id),
  );

  const getProjectName = (projectId) =>
    projects.find((p) => String(p.id) === String(projectId))?.name || "Unknown";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(
      dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z",
    );
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

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

      {/* Your Teams */}
      <div className="mb-7">
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
                    <p className="text-xs font-medium text-gray-900">
                      {team.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {team.members?.length || 0} member
                      {(team.members?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[10px] text-amber-500">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Your Projects */}
      <div className="mb-7">
        <h2 className="mb-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Your Projects
        </h2>
        <div className="rounded-md border border-gray-200 bg-white">
          {userProjects.length === 0 ? (
            <div className="py-10 text-center">
              <FolderKanban className="mx-auto mb-2 h-6 w-6 text-gray-300" />
              <p className="text-xs font-medium text-gray-900">
                No projects yet.
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Projects from your teams will show up here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100">
                      <FolderKanban className="h-3 w-3 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900">
                        {project.name}
                      </p>
                      <div className="mt-1 w-44 max-w-full">
                        <ProjectProgressBar
                          completed={project.completedTaskCount}
                          total={project.totalTaskCount}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-500">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Your Tasks */}
      <div>
        <h2 className="mb-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Your Tasks
        </h2>
        <div className="rounded-md border border-gray-200 bg-white">
          {userTasks.length === 0 ? (
            <div className="py-10 text-center">
              <ListTodo className="mx-auto mb-2 h-6 w-6 text-gray-300" />
              <p className="text-xs font-medium text-gray-900">
                No tasks assigned to you.
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Tasks assigned to you will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center gap-4 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium flex-shrink-0 ${
                      STATUS_BADGE[task.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {STATUS_LABEL[task.status] || task.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {getProjectName(task.projectId)}
                    </p>
                  </div>
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
