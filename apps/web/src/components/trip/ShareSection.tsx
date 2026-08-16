import { useEffect, useState } from "react";
import {
  getOrCreateInvite,
  listCollaborators,
  removeCollaborator,
  revokeInvite,
  updateMyVehicle,
} from "@/api/sharing";
import type { Collaborator } from "@/api/types";
import { useAuth } from "@/lib/AuthContext";

export default function ShareSection({ tripId, isOwner }: { tripId: number; isOwner: boolean }) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicleDraft, setVehicleDraft] = useState("");
  const [editingVehicle, setEditingVehicle] = useState(false);

  function refresh() {
    listCollaborators(tripId).then((list) => {
      setCollaborators(list);
      const mine = list.find((c) => c.user_id === user?.id);
      setVehicleDraft(mine?.vehicle ?? "");
    });
  }

  useEffect(refresh, [tripId, user?.id]);

  async function handleSaveVehicle() {
    await updateMyVehicle(tripId, { vehicle: vehicleDraft.trim() || null });
    setEditingVehicle(false);
    refresh();
  }

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
      <h2 className="text-xl font-semibold">Riders</h2>
      <ul className="flex flex-col gap-2">
        {collaborators.map((c, idx) => {
          const isOwnerRow = idx === 0;
          const isMe = c.user_id === user?.id;
          return (
            <li
              key={c.user_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800 px-4 py-2"
            >
              <span>
                {c.name} <span className="text-xs text-slate-500">({c.email})</span>
                {isOwnerRow && <span className="ml-2 text-xs text-slate-500">Owner</span>}
              </span>

              <div className="flex items-center gap-3">
                {isMe && editingVehicle ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Your vehicle"
                      value={vehicleDraft}
                      onChange={(e) => setVehicleDraft(e.target.value)}
                      className="w-32 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSaveVehicle}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Save
                    </button>
                  </div>
                ) : isMe ? (
                  <button
                    onClick={() => setEditingVehicle(true)}
                    className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400 hover:border-emerald-600 hover:text-emerald-300"
                  >
                    {c.vehicle ?? "Add your vehicle"}
                  </button>
                ) : (
                  c.vehicle && (
                    <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">
                      {c.vehicle}
                    </span>
                  )
                )}

                {isOwner && !isOwnerRow && (
                  <button
                    onClick={() => handleRemove(c.user_id)}
                    className="text-xs text-slate-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {collaborators.length <= 1 && (
        <p className="text-sm text-slate-500">Just you so far.</p>
      )}

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
