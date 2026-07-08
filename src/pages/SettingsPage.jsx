import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.username || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // Profile update via API is handled by the backend MeController
    // For now, just show a confirmation
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-6 py-8 max-w-lg mx-auto">
      <div className="mb-5">
        <h1 className="text-base font-semibold text-gray-900">Settings</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Manage your account and profile.
        </p>
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-white">
            {(user?.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.username}
            </p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="block w-full rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-400 bg-gray-50 cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-gray-400">
              Email cannot be changed.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
