import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/api/client";
import { acceptInvite, getInvitePreview } from "@/api/sharing";
import type { InvitePreview } from "@/api/types";
import { useAuth } from "@/lib/AuthContext";
import { TRIP_TYPE_META } from "@/lib/tripTypes";

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    getInvitePreview(token)
      .then(setPreview)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "This invite link isn't valid.");
      });
  }, [isAuthenticated, token]);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    try {
      const result = await acceptInvite(token);
      navigate(`/app/trips/${result.trip_id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not accept this invite.");
    } finally {
      setAccepting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="w-full max-w-sm rounded-lg border border-slate-800 p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold">You've been invited to a trip</h1>
          <p className="mb-6 text-sm text-slate-400">Log in or create an account to see it.</p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              state={{ from: `/invite/${token}` }}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              Log in
            </Link>
            <Link
              to="/register"
              state={{ from: `/invite/${token}` }}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-100 transition-colors hover:border-slate-500"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-lg border border-slate-800 p-6 text-center">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!error && !preview && <p className="text-sm text-slate-500">Loading…</p>}
        {preview && (
          <>
            <p className="mb-1 text-3xl">{TRIP_TYPE_META[preview.trip_type].icon}</p>
            <h1 className="mb-1 text-xl font-semibold">{preview.trip_title}</h1>
            <p className="mb-6 text-sm text-slate-400">
              {preview.owner_name} invited you to plan this trip together.
            </p>
            {preview.already_member ? (
              <button
                onClick={() => navigate(`/app/trips/${preview.trip_id}`)}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                Go to trip
              </button>
            ) : (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
              >
                {accepting ? "Joining…" : "Join trip"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
