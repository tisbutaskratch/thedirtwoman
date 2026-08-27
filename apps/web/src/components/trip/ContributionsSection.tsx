import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createContribution,
  deleteContribution,
  listContributions,
  updateContribution,
} from "@/api/contributions";
import { listCollaborators } from "@/api/sharing";
import type { Collaborator, Contribution, ContributionKind } from "@/api/types";
import { AddForm, Emoji, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import AssigneeSelect from "@/components/trip/AssigneeSelect";
import { assigneeValue, assignmentPayload } from "@/lib/assignment";
import { SECTION_META } from "@/lib/tripTypes";

/*
 * Who is bringing what, on which day.
 *
 * Grouped by day rather than by kind, because the question people actually
 * ask is "what do I need for Thursday", not "show me all the desserts". The
 * unclaimed group sits last and stays visible even when empty is not an
 * option, since an unclaimed row is the one thing here that needs somebody
 * to act.
 */

const KINDS: { value: ContributionKind; label: string; glyph: string }[] = [
  { value: "food", label: "Food", glyph: "🍽️" },
  { value: "dessert", label: "Dessert", glyph: "🍰" },
  { value: "drink", label: "Drinks", glyph: "🥤" },
  { value: "game", label: "Games", glyph: "🎲" },
  { value: "supplies", label: "Supplies", glyph: "🧻" },
  { value: "other", label: "Other", glyph: "📦" },
];

const KIND_GLYPH = Object.fromEntries(KINDS.map((k) => [k.value, k.glyph])) as Record<
  ContributionKind,
  string
>;

/** "Day 3", or the real date when the trip has one. */
function dayLabel(dayIndex: number | null, startDate: string | null): string {
  if (dayIndex === null) return "Not yet on a day";
  if (!startDate) return `Day ${dayIndex}`;
  const start = new Date(`${startDate}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() + dayIndex - 1);
  return start.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ContributionsSection({
  tripId,
  startDate,
  dayCount,
  canEdit,
  onChange,
}: {
  tripId: number;
  startDate: string | null;
  /** How many days the gathering runs, so the day picker offers real days. */
  dayCount: number;
  canEdit: boolean;
  onChange?: () => void;
}) {
  const [items, setItems] = useState<Contribution[]>([]);
  const [roster, setRoster] = useState<Collaborator[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ContributionKind>("food");
  const [dayIndex, setDayIndex] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [serves, setServes] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listContributions(tripId).then(setItems);
    listCollaborators(tripId).then(setRoster);
  }

  useEffect(refresh, [tripId]);

  const nameByUserId = useMemo(
    () => new Map(roster.map((c) => [c.user_id, c.name])),
    [roster],
  );

  // Days in order, with the undated group last: it is the pile that still
  // needs a decision, so it reads better as a loose end than as day zero.
  const groups = useMemo(() => {
    const byDay = new Map<number | null, Contribution[]>();
    for (const item of items) {
      const list = byDay.get(item.day_index) ?? [];
      list.push(item);
      byDay.set(item.day_index, list);
    }
    return [...byDay.entries()].sort(([a], [b]) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a - b;
    });
  }, [items]);

  const unclaimed = items.filter((i) => i.assigned_to_user_id === null && !i.assigned_to_all);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createContribution(tripId, {
        name: name.trim(),
        kind,
        day_index: dayIndex ? Number(dayIndex) : null,
        serves: serves ? Number(serves) : null,
        notes: notes.trim() || null,
        ...assignmentPayload(assignedTo),
      });
      setName("");
      setServes("");
      setNotes("");
      setShowAdd(false);
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleConfirmed(item: Contribution) {
    await updateContribution(item.id, { confirmed: !item.confirmed });
    refresh();
    onChange?.();
  }

  async function reassign(item: Contribution, value: string) {
    await updateContribution(item.id, assignmentPayload(value));
    refresh();
    onChange?.();
  }

  async function remove(id: number) {
    await deleteContribution(id);
    refresh();
    onChange?.();
  }

  return (
    <Section
      glyph="🍽️"
      title="Who's bringing what"
      count={items.length}
      tone={SECTION_META.packing.tone}
      meta={
        unclaimed.length > 0 ? (
          <span className="text-amber-500">{unclaimed.length} still unclaimed</span>
        ) : items.length > 0 ? (
          "All claimed"
        ) : undefined
      }
      actions={
        canEdit && (
          <IconButton
            onClick={() => setShowAdd((open) => !open)}
            title="Add something"
            icon="add"
          />
        )
      }
    >
      {showAdd && canEdit && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]">
            <input
              type="text"
              autoFocus
              placeholder="Ham, pumpkin pie, Scrabble…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ContributionKind)}
              aria-label="What kind of thing"
              className={inputClass}
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.glyph} {k.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_6rem]">
            <select
              value={dayIndex}
              onChange={(e) => setDayIndex(e.target.value)}
              aria-label="Which day"
              className={inputClass}
            >
              <option value="">No day yet</option>
              {Array.from({ length: Math.max(dayCount, 1) }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {dayLabel(d, startDate)}
                </option>
              ))}
            </select>
            <AssigneeSelect value={assignedTo} onChange={setAssignedTo} roster={roster} />
            <input
              type="number"
              min={0}
              placeholder="serves"
              aria-label="Roughly how many it serves"
              value={serves}
              onChange={(e) => setServes(e.target.value)}
              className={inputClass}
            />
          </div>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </AddForm>
      )}

      {items.length === 0 && !showAdd && (
        <EmptyState
          glyph="🍽️"
          message="Nothing on the table yet. Add what you need and let people claim it."
        />
      )}

      {groups.map(([day, dayItems]) => (
        <div key={day ?? "unscheduled"} className="flex flex-col gap-1.5">
          <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-content-subtle">
            {dayLabel(day, startDate)}
            <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-[11px] normal-case tracking-normal">
              {dayItems.length}
            </span>
          </h4>
          {dayItems.map((item) => {
            const owner = item.assigned_to_all
              ? "Everyone"
              : item.assigned_to_user_id !== null
                ? (nameByUserId.get(item.assigned_to_user_id) ?? "Someone")
                : null;
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-card border border-edge bg-surface-raised px-3 py-2"
              >
                <Emoji glyph={KIND_GLYPH[item.kind]} />
                <span
                  className={`font-medium ${item.confirmed ? "text-content" : "text-content-muted"}`}
                >
                  {item.name}
                </span>
                {item.serves !== null && (
                  <span className="text-xs text-content-subtle">serves {item.serves}</span>
                )}
                {item.notes && (
                  <span className="text-xs italic text-content-subtle">{item.notes}</span>
                )}
                <div className="ml-auto flex items-center gap-1.5">
                  {canEdit ? (
                    <AssigneeSelect
                      value={assigneeValue(item)}
                      onChange={(value) => reassign(item, value)}
                      roster={roster}
                      variant="chip"
                      highlighted={owner === null}
                    />
                  ) : (
                    <span className="text-xs text-content-subtle">{owner ?? "Unclaimed"}</span>
                  )}
                  {canEdit && (
                    <>
                      {/* Claimed is a promise; confirmed is that they have
                          actually said yes. Worth the extra tap in the week
                          before a holiday. */}
                      <button
                        type="button"
                        onClick={() => toggleConfirmed(item)}
                        title={item.confirmed ? "Confirmed" : "Mark confirmed"}
                        aria-pressed={item.confirmed}
                        className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                          item.confirmed
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                            : "border-edge text-content-subtle hover:border-edge-strong"
                        }`}
                      >
                        {item.confirmed ? "Confirmed" : "Confirm"}
                      </button>
                      <IconButton
                        onClick={() => remove(item.id)}
                        title="Remove"
                        icon="delete"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </Section>
  );
}
