import { useEffect, useState, type FormEvent } from "react";
import {
  cancelPendingInvite,
  getOrCreateInvite,
  inviteByEmail,
  listCollaborators,
  listPendingInvites,
  removeCollaborator,
  updateMyVehicle,
} from "@/api/sharing";
import { ApiError } from "@/api/client";
import type { Collaborator, PendingMember } from "@/api/types";
import { useAuth } from "@/lib/AuthContext";

export default function MembersSection({ tripId, isOwner }: { tripId: number; isOwner: boolean }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Collaborator[]>([]);
  const [pending, setPending] = useState<PendingMember[]>([]);
  const [copied, setCopied] = useState(false);
  const [linking, setLinking] = useState(false);
  const [vehicleDraft, setVehicleDraft] = useState("");
  const [rangeDraft, setRangeDraft] = useState("");
  const [editingBike, setEditingBike] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  function refresh() {
    listCollaborators(tripId).then((list) => {
      setMembers(list);
      const mine = list.find((c) => c.user_id === user?.id);
      setVehicleDraft(mine?.vehicle ?? "");
      setRangeDraft(mine?.fuel_range_miles?.toString() ?? "");
    });
    if (isOwner) listPendingInvites(tripId).then(setPending);
  }

  useEffect(refresh, [tripId, user?.id, isOwner]);

  async function handleSaveBike() {
    await updateMyVehicle(tripId, {
      vehicle: vehicleDraft.trim() || null,
      fuel_range_miles: rangeDraft ? Number(rangeDraft) : null,
    });
    setEditingBike(false);
    refresh();
  }

  async function handleCopyLink() {
    setLinking(true);
    try {
      const invite = await getOrCreateInvite(tripId);
      await navigator.clipboard.writeText(`${window.location.origin}/invite/${invite.token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setLinking(false);
    }
  }

  async function handleRemove(userId: number) {
    await removeCollaborator(tripId, userId);
    refresh();
  }

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    try {
      await inviteByEmail(tripId, { email: inviteEmail.trim() });
      setInviteEmail("");
      refresh();
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : "Could not send invite.");
    } finally {
      setInviting(false);
    }
  }

  async function handleCancelPending(inviteId: number) {
    await cancelPendingInvite(tripId, inviteId);
    refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Members</h2>
        {isOwner && (
          <>
            <button
              onClick={handleCopyLink}
              disabled={linking}
              title={copied ? "Copied!" : "Copy shareable link"}
              className="text-slate-500 hover:text-emerald-300 disabled:opacity-50"
            >
              {copied ? "✓" : "🔗"}
            </button>
            {!showInvite && (
              <button
                onClick={() => setShowInvite(true)}
                title="Invite by email"
                className="text-slate-500 hover:text-emerald-300"
              >
                +
              </button>
            )}
          </>
        )}
      </div>

      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowInvite(false);
                setInviteError(null);
              }}
              title="Close"
              className="text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="email"
              autoFocus
              placeholder="rider@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={inviting}
              title="Send invite"
              className="text-xl text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              ✓
            </button>
          </div>
          {inviteError && <p className="text-xs text-red-400">{inviteError}</p>}
        </form>
      )}

      <ul className="flex flex-col gap-2">
        {members.map((c, idx) => {
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
                {isMe && editingBike ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Make & model"
                      value={vehicleDraft}
                      onChange={(e) => setVehicleDraft(e.target.value)}
                      className="w-28 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Range (mi)"
                      value={rangeDraft}
                      onChange={(e) => setRangeDraft(e.target.value)}
                      className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSaveBike}
                      title="Save"
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingBike(false)}
                      title="Cancel"
                      className="text-slate-500 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </div>
                ) : isMe ? (
                  <button
                    onClick={() => setEditingBike(true)}
                    className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400 hover:border-emerald-600 hover:text-emerald-300"
                  >
                    {c.vehicle ?? "Add your bike"}
                    {c.fuel_range_miles ? ` · ${c.fuel_range_miles} mi range` : ""}
                  </button>
                ) : (
                  (c.vehicle || c.fuel_range_miles) && (
                    <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">
                      {c.vehicle}
                      {c.vehicle && c.fuel_range_miles ? " · " : ""}
                      {c.fuel_range_miles ? `${c.fuel_range_miles} mi range` : ""}
                    </span>
                  )
                )}

                {isOwner && !isOwnerRow && (
                  <button
                    onClick={() => handleRemove(c.user_id)}
                    title="Remove member"
                    className="text-slate-500 hover:text-red-400"
                  >
                    −
                  </button>
                )}
              </div>
            </li>
          );
        })}

        {pending.map((p) => (
          <li
            key={`pending-${p.id}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-slate-800 px-4 py-2"
          >
            <span className="text-slate-400">
              {p.email}{" "}
              <span className="ml-2 rounded-full border border-amber-900 bg-amber-950/40 px-2 py-0.5 text-xs text-amber-300">
                Pending
              </span>
            </span>
            <button
              onClick={() => handleCancelPending(p.id)}
              title="Cancel invite"
              className="text-slate-500 hover:text-red-400"
            >
              −
            </button>
          </li>
        ))}
      </ul>
      {members.length <= 1 && pending.length === 0 && (
        <p className="text-sm text-slate-500">Just you so far.</p>
      )}
    </section>
  );
}
