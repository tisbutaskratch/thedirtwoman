import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { routes } from "@/lib/site";

const inputClass =
  "w-full rounded-md border border-edge bg-surface-sunken px-3 py-2 text-sm text-content outline-none focus:border-emerald-500";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? routes.dashboard;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, name);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create an account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="register-name"
            className="mb-1 block text-xs uppercase tracking-widest text-content-subtle"
          >
            Name
          </label>
          <input
            id="register-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="register-email"
            className="mb-1 block text-xs uppercase tracking-widest text-content-subtle"
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="mb-1 block text-xs uppercase tracking-widest text-content-subtle"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        {/*
         * Unticked by default and required to submit. A pre-ticked box is not
         * agreement, and the link opens the policy in a new tab so nobody
         * loses a half-filled form to read it.
         */}
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-content-muted">
          <input
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
          />
          <span>
            I have read the{" "}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              privacy policy
            </Link>{" "}
            and agree to how my data is handled.
          </span>
        </label>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !agreed}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-content-subtle">
        Already have an account?{" "}
        <Link to="/login" state={location.state} className="text-accent hover:text-accent-hover">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
