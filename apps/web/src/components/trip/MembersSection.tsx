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
import { AddForm, Badge, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";
import { useAuth } from "@/lib/AuthContext";

/** Deterministic avatar tint so each member is visually identifiable. */
const AVATAR_TONES = [
  "bg-emerald-950/60 text-emerald-300",
  "bg-cyan-950/60 text-cyan-300",
  "bg-violet-950/60 text-violet-300",
  "bg-amber-950/60 text-amber-300",
  "bg-rose-950/60 text-rose-300",
  "bg-sky-950/60 text-sky-300",
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

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
    <Section
      icon={SECTION_META.members.icon}
      title="Members"
      tone={SECTION_META.members.tone}
      count={members.length + pending.length}
      actions={
        isOwner && (
          <>
            <IconButton
              onClick={handleCopyLink}
              disabled={linking}
              title={copied ? "Copied!" : "Copy shareable link"}
            >
              {copied ? "✓" : "🔗"}
            </IconButton>
            {!showInvite && (
              <IconButton onClick={() => setShowInvite(true)} title="Invite by email">
                +
              </IconButton>
            )}
          </>
        )
      }
    >
      {showInvite && (
        <AddForm
          onSubmit={handleInvite}
          onClose={() => {
            setShowInvite(false);
            setInviteError(null);
          }}
          submitting={inviting}
          submitTitle="Send invite"
        >
          <input
            type="email"
            autoFocus
            placeholder="rider@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className={inputClass}
          />
          {inviteError && <p className="text-xs text-rose-400">{inviteError}</p>}
        </AddForm>
      )}

      <ul className="flex flex-col gap-1.5">
        {members.map((c, idx) => {
          const isOwnerRow = idx === 0;
          const isMe = c.user_id === user?.id;
          return (
            <li
              key={c.user_id}
              className="flex flex-wrap items-center gap-2.5 rounded-md border border-edge bg-surface-raised px-3 py-2"
            >
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_TONES[idx % AVATAR_TONES.length]}`}
              >
                {initials(c.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-content">
                  {c.name}
                  {isOwnerRow && (
                    <span className="ml-1.5 text-xs font-normal text-content-subtle">Owner</span>
                  )}
                </p>
                <p className="truncate text-xs text-content-subtle">{c.email}</p>
              </div>

              {isMe && editingBike ? (
                <div className="flex w-full items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Make & model"
                    value={vehicleDraft}
                    onChange={(e) => setVehicleDraft(e.target.value)}
                    className={`${inputClass} flex-1 py-1 text-xs`}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Range mi"
                    value={rangeDraft}
                    onChange={(e) => setRangeDraft(e.target.value)}
                    className={`${inputClass} w-24 py-1 text-xs`}
                  />
                  <IconButton onClick={handleSaveBike} title="Save" variant="confirm">
                    ✓
                  </IconButton>
                  <IconButton onClick={() => setEditingBike(false)} title="Cancel">
                    ×
                  </IconButton>
                </div>
              ) : isMe ? (
                <button
                  onClick={() => setEditingBike(true)}
                  className="rounded-full border border-edge bg-surface-overlay px-2 py-0.5 text-xs text-content-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {c.vehicle ?? "Add your ride"}
                  {c.fuel_range_miles ? ` · ${c.fuel_range_miles} mi` : ""}
                </button>
              ) : (
                (c.vehicle || c.fuel_range_miles) && (
                  <Badge tone="amber">
                    {c.vehicle}
                    {c.vehicle && c.fuel_range_miles ? " · " : ""}
                    {c.fuel_range_miles ? `${c.fuel_range_miles} mi` : ""}
                  </Badge>
                )
              )}

              {isOwner && !isOwnerRow && (
                <IconButton
                  onClick={() => handleRemove(c.user_id)}
                  title="Remove member"
                  variant="danger"
                >
                  −
                </IconButton>
              )}
            </li>
          );
        })}

        {pending.map((p) => (
          <li
            key={`pending-${p.id}`}
            className="flex flex-wrap items-center gap-2.5 rounded-md border border-dashed border-edge px-3 py-2"
          >
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs text-content-subtle"
            >
              ✉️
            </span>
            <p className="min-w-0 flex-1 truncate text-sm text-content-muted">{p.email}</p>
            <Badge tone="amber">Pending</Badge>
            <IconButton
              onClick={() => handleCancelPending(p.id)}
              title="Cancel invite"
              variant="danger"
            >
              −
            </IconButton>
          </li>
        ))}
      </ul>

      {members.length <= 1 && pending.length === 0 && (
        <p className="text-sm text-content-subtle">Just you so far — invite the crew.</p>
      )}
    </Section>
  );
}
