import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/api/client";
import { acceptInvite, getInvitePreview } from "@/api/sharing";
import type { InvitePreview } from "@/api/types";
import { useAuth } from "@/lib/AuthContext";
import TripMark from "@/art/tripMarks";

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
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-content">
        <div className="w-full max-w-sm rounded-lg border border-edge p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold">You've been invited to a trip</h1>
          <p className="mb-6 text-sm text-content-muted">Log in or create an account to see it.</p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              state={{ from: `/invite/${token}` }}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              Log in
            </Link>
            <Link
              to="/register"
              state={{ from: `/invite/${token}` }}
              className="rounded-md border border-edge px-4 py-2 text-sm text-content transition-colors hover:border-edge-strong"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-content">
      <div className="w-full max-w-sm rounded-lg border border-edge p-6 text-center">
        {error && <p className="text-sm text-rose-400">{error}</p>}
        {!error && !preview && <p className="text-sm text-content-subtle">Loading…</p>}
        {preview && (
          <>
            <div className="mb-1 flex justify-center text-accent">
              <TripMark type={preview.trip_type} size={36} />
            </div>
            <h1 className="mb-1 text-xl font-semibold">{preview.trip_title}</h1>
            <p className="mb-6 text-sm text-content-muted">
              {preview.invited_by_name} invited you
              {preview.role === "viewer"
                ? " to follow along with this trip."
                : " to plan this trip together."}
            </p>
            {preview.already_member ? (
              <button
                onClick={() => navigate(`/app/trips/${preview.trip_id}`)}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
              >
                Go to trip
              </button>
            ) : (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
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
