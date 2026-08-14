import { useEffect, useState } from "react";
import {
  getOrCreateInvite,
  listCollaborators,
  removeCollaborator,
  revokeInvite,
} from "@/api/sharing";
import type { Collaborator } from "@/api/types";

export default function ShareSection({ tripId, isOwner }: { tripId: number; isOwner: boolean }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  function refresh() {
    listCollaborators(tripId).then(setCollaborators);
  }

  useEffect(refresh, [tripId]);

  async function handleGetLink() {
    setLoading(true);
    try {
      const invite = await getOrCreateInvite(tripId);
      setInviteUrl(`${window.location.origin}/invite/${invite.token}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRevoke() {
    await revokeInvite(tripId);
    setInviteUrl(null);
  }

  async function handleRemove(userId: number) {
    await removeCollaborator(tripId, userId);
    refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Shared with</h2>
      <ul className="flex flex-col gap-2">
        {collaborators.map((c) => (
          <li
            key={c.user_id}
            className="flex items-center justify-between rounded-md border border-slate-800 px-4 py-2"
          >
            <span>
              {c.name} <span className="text-xs text-slate-500">({c.email})</span>
            </span>
            {isOwner && (
              <button
                onClick={() => handleRemove(c.user_id)}
                className="text-xs text-slate-500 hover:text-red-400"
              >
                Remove
              </button>
            )}
          </li>
        ))}
        {collaborators.length === 0 && <p className="text-sm text-slate-500">Just you so far.</p>}
      </ul>

      {isOwner &&
        (inviteUrl ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={inviteUrl}
              onFocus={(e) => e.target.select()}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300"
            />
            <button
              onClick={handleCopy}
              className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleRevoke}
              className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-400 transition-colors hover:border-red-700"
            >
              Revoke link
            </button>
          </div>
        ) : (
          <button
            onClick={handleGetLink}
            disabled={loading}
            className="w-fit rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Get shareable link"}
          </button>
        ))}
    </section>
  );
}
