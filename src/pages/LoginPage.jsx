import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded bg-amber-400 shadow-sm">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Workbench</h1>
          <p className="mt-1 text-xs text-gray-500">Sign in to your account</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-slide-up">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-2.5 text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                placeholder="admin@workbench.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-amber-400 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber-200 focus:outline-none cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-amber-600 hover:text-amber-500"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
