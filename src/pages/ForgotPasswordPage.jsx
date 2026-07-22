import { useState } from "react";
import { Link } from "react-router-dom";
import { Wrench, ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // TODO: call backend to send reset code
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
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
          <p className="mt-1 text-xs text-gray-500">
            {sent ? "Check your email" : "Reset your password"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-scale-in">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-2.5 text-xs text-red-600">
              {error}
            </div>
          )}

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                Check your email
              </p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                We sent a password reset code to{" "}
                <span className="font-medium text-gray-700">{email}</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Enter the code on the next page to reset your password.
              </p>
              <div className="mt-5 space-y-2">
                <Link
                  to={`/reset-password?email=${encodeURIComponent(email)}`}
                  className="block w-full rounded-md bg-amber-400 px-3 py-2 text-xs font-semibold text-white text-center transition-colors hover:bg-amber-500"
                >
                  Enter Reset Code
                </Link>
                <button
                  onClick={() => setSent(false)}
                  className="block w-full text-center text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
                  placeholder="you@example.com"
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5" />
                    Send Reset Code
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
