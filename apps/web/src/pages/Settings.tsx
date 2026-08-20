import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { deleteAccount, type SharedTripAction } from "@/api/account";
import Critter from "@/art/critters";
import { Card, Icon, inputClass } from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";
import { routes } from "@/lib/site";

/*
 * Account settings, which today is mostly the one action that cannot be
 * undone.
 *
 * Deleting is deliberately unhurried: it says what will happen to each kind
 * of trip before asking, makes the choice about other people's trips
 * explicit rather than defaulted, and requires the account's own email typed
 * out. A confirm dialog is one careless click; this is not.
 */
export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sharedTrips, setSharedTrips] = useState<SharedTripAction>("keep");
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailMatches = confirm.trim().toLowerCase() === (user?.email ?? "").toLowerCase();

  async function handleDelete(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setDeleting(true);
    try {
      await deleteAccount(sharedTrips, confirm.trim());
      // The account is gone, so the stored tokens refer to nothing. Clearing
      // them and leaving for the front door is the only sensible next screen.
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the account.");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="relative">
        <Critter
          name="hedgehog"
          size={36}
          className="absolute -top-1 right-0 hidden text-accent opacity-100 sm:block"
        />
        <Link
          to={routes.dashboard}
          className="inline-flex items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-content"
        >
          <Icon name="back" size={14} /> All trips
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Settings</h1>
      </header>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold text-content">Account</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-content-subtle">Name</dt>
            <dd className="text-content">{user?.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-content-subtle">Email</dt>
            <dd className="text-content">{user?.email}</dd>
          </div>
        </dl>
        <p className="text-sm text-content-muted">
          What is stored and who can see it is set out in the{" "}
          <Link
            to="/privacy"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            privacy policy
          </Link>
          .
        </p>
      </Card>

      {/* --------------------------------------------------------- deleting */}
      <Card className="flex flex-col gap-4 border-rose-500/40">
        <div>
          <h2 className="font-semibold text-content">Delete this account</h2>
          <p className="mt-1 text-sm leading-relaxed text-content-muted">
            This cannot be undone. Your account, your journal entries and any trip only you are
            on will be deleted straight away.
          </p>
        </div>

        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-content">
              Trips you created that other people are on
            </legend>

            {/*
             * No default that quietly destroys someone else's planning: both
             * options are stated in full, and the harmless one is preselected.
             */}
            <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-edge p-3 text-sm transition-colors hover:border-edge-strong">
              <input
                type="radio"
                name="shared-trips"
                value="keep"
                checked={sharedTrips === "keep"}
                onChange={() => setSharedTrips("keep")}
                className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
              />
              <span>
                <span className="font-medium text-content">Leave them with everyone else</span>
                <span className="mt-0.5 block text-content-muted">
                  The trip stays exactly as it is and belongs to everyone still on it. Nobody
                  inherits it, so it cannot get stuck behind one inactive account, and nobody
                  is bothered about it.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-edge p-3 text-sm transition-colors hover:border-edge-strong">
              <input
                type="radio"
                name="shared-trips"
                value="ask"
                checked={sharedTrips === "ask"}
                onChange={() => setSharedTrips("ask")}
                className="mt-0.5 h-4 w-4 shrink-0 accent-rose-600"
              />
              <span>
                <span className="font-medium text-content">
                  Ask the others if they want them too
                </span>
                <span className="mt-0.5 block text-content-muted">
                  Everyone on the trip is emailed and decides for themselves. Anyone who wants
                  it keeps it, and it is deleted only once everybody has left.
                </span>
              </span>
            </label>
          </fieldset>

          <div>
            <label
              htmlFor="confirm-email"
              className="mb-1 block text-sm text-content-muted"
            >
              Type <span className="font-medium text-content">{user?.email}</span> to confirm
            </label>
            <input
              id="confirm-email"
              type="text"
              autoComplete="off"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={!emailMatches || deleting}
            className="w-fit rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </form>
      </Card>
    </div>
  );
}
