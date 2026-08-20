import { useEffect, useState, type FormEvent } from "react";
import {
  cancelPendingInvite,
  getOrCreateInvite,
  inviteByEmail,
  listCollaborators,
  listPendingInvites,
  removeCollaborator,
  setCollaboratorRole,
  updateMyVehicle,
} from "@/api/sharing";
import { ApiError } from "@/api/client";
import type { Collaborator, PendingMember, TripRole } from "@/api/types";
import { AddForm, Badge, Emoji, EmptyHint, IconButton, Section, inputClass } from "@/components/ui";
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
  const [inviteRole, setInviteRole] = useState<TripRole>("editor");
  const [inviteError, setInviteError] = useState<string | null>(null);
  // The invite is saved either way; this says whether anyone was told.
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  // The roster sits above the timeline, so it collapses to a single avatar
  // strip once you know who's coming and want the schedule back at the top.
  const [collapsed, setCollapsed] = useState(false);

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

  async function handleRoleChange(userId: number, role: TripRole) {
    await setCollaboratorRole(tripId, userId, role);
    refresh();
  }

  async function handleCopyLink() {
    setLinking(true);
    try {
      // The link grants whatever the invite dropdown is currently set to,
      // so a read-only link can never hand out edit rights by accident.
      const invite = await getOrCreateInvite(tripId, inviteRole);
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
      const pending = await inviteByEmail(tripId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      // A silent failure here is the worst outcome: the invite exists, so
      // everything looks fine, and the sender only finds out when nobody
      // turns up. Say it plainly and point at the share link instead.
      setInviteNotice(
        pending.email_sent === false
          ? "Invite created, but the email could not be sent. Copy the share link and send it yourself."
          : null,
      );
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

  // Everyone who can change the plan is a collaborator; everyone who can
  // only watch is the audience. Nobody is an "owner".
  const collaborators = members.filter((c) => c.role === "editor");
  const audience = members.filter((c) => c.role === "viewer");

  return (
    <Section
      glyph={SECTION_META.members.glyph}
      title="Crew"
      tone={SECTION_META.members.tone}
      count={members.length + pending.length}
      meta={
        audience.length > 0
          ? `${collaborators.length} collaborating · ${audience.length} watching`
          : undefined
      }
      actions={
        <>
          {isOwner && (
            <>
              <IconButton
                onClick={handleCopyLink}
                disabled={linking}
                title={copied ? "Copied!" : "Copy shareable link"}
                icon={copied ? "confirm" : "share"}
              />
              {!showInvite && (
                <IconButton onClick={() => setShowInvite(true)} title="Invite by email" icon="add" />
              )}
            </>
          )}
          <IconButton
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Show members" : "Hide members"}
            icon={collapsed ? "collapse" : "expand"}
          />
        </>
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
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <input
              type="email"
              autoFocus
              placeholder="rider@example.com"
              aria-label="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className={inputClass}
            />
            <select
              value={inviteRole}
              aria-label="Access level"
              onChange={(e) => setInviteRole(e.target.value as TripRole)}
              className={inputClass}
            >
              <option value="editor">Can edit</option>
              <option value="viewer">View only</option>
            </select>
          </div>
          {inviteError && <p className="text-xs text-rose-400">{inviteError}</p>}
        </AddForm>
      )}

      {/* Amber, not red: the invite worked, only the notification did not. */}
      {inviteNotice && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          {inviteNotice}
        </p>
      )}

      {collapsed ? (
        // Collapsed: just enough to see the crew at a glance.
        <div className="flex flex-wrap items-center gap-1.5">
          {members.map((c, idx) => (
            <span
              key={c.user_id}
              title={c.name}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_TONES[idx % AVATAR_TONES.length]}`}
            >
              {initials(c.name)}
            </span>
          ))}
          {pending.length > 0 && (
            <Badge tone="amber">{pending.length} pending</Badge>
          )}
        </div>
      ) : (
        /*
         * A row of small cards rather than stacked full-width rows: a member
         * carries very little information, so letting each one claim an
         * entire line wastes the width the section already occupies.
         */
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((c, idx) => {
            const isMe = c.user_id === user?.id;
            return (
              <li
                key={c.user_id}
                className="flex flex-col gap-2 rounded-card border border-edge bg-surface-raised p-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_TONES[idx % AVATAR_TONES.length]}`}
                  >
                    {initials(c.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-content">{c.name}</p>
                    <p className="truncate text-xs text-content-subtle">{c.email}</p>
                  </div>
                  {isOwner && !c.is_creator && (
                    <IconButton
                      onClick={() => handleRemove(c.user_id)}
                      title="Remove from trip"
                      variant="danger"
                      icon="remove"
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {isOwner && !c.is_creator ? (
                    <select
                      value={c.role}
                      aria-label={`Access level for ${c.name}`}
                      onChange={(e) => handleRoleChange(c.user_id, e.target.value as TripRole)}
                      className={`rounded-full border px-1.5 py-0 text-[11px] outline-none ${
                        c.role === "viewer"
                          ? "border-edge bg-surface-overlay text-content-muted"
                          : "border-emerald-800/60 bg-emerald-950/50 text-emerald-300"
                      }`}
                    >
                      <option value="editor">Collaborator</option>
                      <option value="viewer">Audience</option>
                    </select>
                  ) : (
                    <Badge tone={c.role === "viewer" ? "cyan" : "emerald"}>
                      {c.role === "viewer" ? "Audience" : "Collaborator"}
                    </Badge>
                  )}
                </div>

                {isMe && editingBike ? (
                  <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_auto_auto] items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Make & model"
                      value={vehicleDraft}
                      onChange={(e) => setVehicleDraft(e.target.value)}
                      className={`${inputClass} py-1 text-xs`}
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="mi"
                      aria-label="Range in miles"
                      value={rangeDraft}
                      onChange={(e) => setRangeDraft(e.target.value)}
                      className={`${inputClass} py-1 text-xs`}
                    />
                    <IconButton
                      onClick={handleSaveBike}
                      title="Save"
                      variant="confirm"
                      icon="confirm"
                    />
                    <IconButton
                      onClick={() => setEditingBike(false)}
                      title="Cancel"
                      icon="close"
                    />
                  </div>
                ) : isMe ? (
                  <button
                    onClick={() => setEditingBike(true)}
                    className="self-start rounded-full border border-edge bg-surface-overlay px-2 py-0.5 text-xs text-content-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    {c.vehicle ?? "Add your ride"}
                    {c.fuel_range_miles ? ` · ${c.fuel_range_miles} mi` : ""}
                  </button>
                ) : (c.vehicle || c.fuel_range_miles) ? (
                  <div className="self-start">
                    <Badge tone="amber">
                      {c.vehicle}
                      {c.vehicle && c.fuel_range_miles ? " · " : ""}
                      {c.fuel_range_miles ? `${c.fuel_range_miles} mi` : ""}
                    </Badge>
                  </div>
                ) : (
                  <EmptyHint>No ride listed</EmptyHint>
                )}
              </li>
            );
          })}

          {pending.map((p) => (
            <li
              key={`pending-${p.id}`}
              className="flex items-center gap-2.5 rounded-card border border-dashed border-edge p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay">
                <Emoji glyph="✉️" size="md" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-content-muted">{p.email}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge tone="amber">Pending</Badge>
                  <Badge tone={p.role === "viewer" ? "cyan" : "emerald"}>
                    {p.role === "viewer" ? "Audience" : "Collaborator"}
                  </Badge>
                </div>
              </div>
              <IconButton
                onClick={() => handleCancelPending(p.id)}
                title="Cancel invite"
                variant="danger"
                icon="remove"
              />
            </li>
          ))}
        </ul>
      )}

      {!collapsed && members.length <= 1 && pending.length === 0 && (
        <p className="text-sm text-content-subtle">Just you so far. Invite the crew.</p>
      )}
    </Section>
  );
}
