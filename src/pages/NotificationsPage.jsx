import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-base font-semibold text-gray-900">Notifications</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Stay up to date with your team activity.
        </p>
      </div>

      <div className="rounded-md border border-gray-200 bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
          <Bell className="h-5 w-5 text-amber-500" />
        </div>
        <p className="text-sm font-medium text-gray-900">
          No notifications yet
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          When someone assigns you a task or leaves a comment, you'll see it
          here.
        </p>
      </div>
    </div>
  );
}
