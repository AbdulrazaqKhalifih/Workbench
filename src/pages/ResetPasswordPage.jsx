import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Wrench,
  KeyRound,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (code.length < 4) {
      setError("Please enter the full reset code");
      return;
    }

    setLoading(true);
    // TODO: call backend to verify code and reset password
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded bg-amber-400 shadow-sm">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Workbench</h1>
            <p className="mt-1 text-xs text-gray-500">Password reset</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-scale-in text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              Password changed!
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Your password has been reset successfully.
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex items-center justify-center gap-1 w-full rounded-md bg-amber-400 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-500"
            >
              Sign in with new password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded bg-amber-400 shadow-sm">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Workbench</h1>
          <p className="mt-1 text-xs text-gray-500">Enter the reset code</p>
          {email && (
            <p className="mt-0.5 text-[10px] text-gray-400">
              Code sent to {email}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-scale-in">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-2.5 text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Reset Code
              </label>
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none tracking-widest text-center font-mono"
                placeholder="_  _  _  _  _  _"
                maxLength={6}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                placeholder="Repeat your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-amber-400 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-3 w-3" />
              Resend code
            </Link>
            <span className="mx-2 text-gray-300">·</span>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
