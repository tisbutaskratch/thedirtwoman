import { useEffect, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createActivity, deleteActivity, listActivities, updateActivity } from "@/api/trips";
import type { Activity, Collaborator } from "@/api/types";
import {
  AddForm,
  EmptyHint,
  EmptyState,
  Field,
  IconButton,
  Section,
  TONE_EDGE,
  TONE_SOFT,
  inputClass,
  type Tone,
} from "@/components/ui";
import { ALL_ASSIGNEE } from "@/lib/assignment";
import { SECTION_META } from "@/lib/tripTypes";

/** Days cycle through the palette so each one is distinguishable at a glance. */
const DAY_TONES: Tone[] = [
  "emerald",
  "sky",
  "violet",
  "amber",
  "rose",
  "cyan",
  "orange",
  "fuchsia",
];

function dayTone(dayIndex: number): Tone {
  const i = (((dayIndex - 1) % DAY_TONES.length) + DAY_TONES.length) % DAY_TONES.length;
  return DAY_TONES[i];
}

function dayDate(tripStartDate: string | null | undefined, dayIndex: number): string | null {
  if (!tripStartDate) return null;
  const start = new Date(`${tripStartDate}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() + (dayIndex - 1));
  return start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function bulletLines(text: string | null): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/*
 * Details and todos sit side by side, so both use the same ROW_HEIGHT
 * rhythm, otherwise the two columns drift apart line by line and stop
 * reading as one row of the day.
 */
const ROW = "flex min-h-7 items-center px-1.5 leading-5";

function BulletList({ text }: { text: string | null }) {
  const lines = bulletLines(text);
  if (lines.length === 0) return <EmptyHint>Nothing noted</EmptyHint>;
  return (
    <ul>
      {lines.map((line, i) => (
        <li key={i} className={`${ROW} gap-2`}>
          <span aria-hidden className="text-content-subtle">
            •
          </span>
          <span className="min-w-0">{line}</span>
        </li>
      ))}
    </ul>
  );
}

interface TodoItem {
  text: string;
  done: boolean;
  /** A member's user id, the ALL_ASSIGNEE sentinel, or null for unclaimed. */
  assignedTo: number | typeof ALL_ASSIGNEE | null;
}

// todos is stored as a JSON-encoded TodoItem[] so each line can carry its
// own checked state and assignee; older rows that predate this (plain
// newline bullets) still parse fine, just as unassigned/unchecked.
function parseTodos(raw: string | null): TodoItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        text: item.text,
        done: !!item.done,
        assignedTo:
          item.assignedTo === ALL_ASSIGNEE
            ? ALL_ASSIGNEE
            : typeof item.assignedTo === "number"
              ? item.assignedTo
              : null,
      }));
    }
  } catch {
    // fall through to legacy plain-text parsing
  }
  return bulletLines(raw).map((text) => ({ text, done: false, assignedTo: null }));
}

function serializeTodos(items: TodoItem[]): string | null {
  return items.length > 0 ? JSON.stringify(items) : null;
}

function reconcileTodos(existing: TodoItem[], newLines: string[]): TodoItem[] {
  const byText = new Map(existing.map((item) => [item.text, item]));
  return newLines.map((text) => byText.get(text) ?? { text, done: false, assignedTo: null });
}

function TodoList({
  activity,
  roster,
  onSaved,
}: {
  activity: Activity;
  roster: Collaborator[];
  onSaved: () => void;
}) {
  const items = parseTodos(activity.todos);

  async function toggle(index: number) {
    const next = items.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    await updateActivity(activity.id, { todos: serializeTodos(next) });
    onSaved();
  }

  async function assign(index: number, value: string) {
    const assignedTo: TodoItem["assignedTo"] =
      value === ALL_ASSIGNEE ? ALL_ASSIGNEE : value ? Number(value) : null;
    const next = items.map((item, i) => (i === index ? { ...item, assignedTo } : item));
    await updateActivity(activity.id, { todos: serializeTodos(next) });
    onSaved();
  }

  if (items.length === 0) return <EmptyHint>No todos</EmptyHint>;

  /*
   * Each todo is one striped, full-width row with the assignee pinned to a
   * fixed right-hand column. The stripe is what carries the eye across the
   * gap, with twenty todos, whitespace alone stops telling you which name
   * belongs to which line.
   */
  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          className={`${ROW} gap-2 rounded-sm odd:bg-surface-overlay/50 hover:bg-surface-overlay`}
        >
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggle(i)}
            className="h-3.5 w-3.5 shrink-0 accent-emerald-500"
          />
          <span className={`min-w-0 flex-1 ${item.done ? "text-content-subtle line-through" : ""}`}>
            {item.text}
          </span>
          <select
            value={item.assignedTo ?? ""}
            onChange={(e) => assign(i, e.target.value)}
            aria-label="Assign to"
            className={`w-24 shrink-0 truncate rounded-full border px-1.5 py-0 text-[11px] outline-none ${
              item.assignedTo === ALL_ASSIGNEE
                ? "border-violet-800/60 bg-violet-950/50 text-violet-300"
                : item.assignedTo === null
                  ? "border-dashed border-edge bg-transparent text-content-subtle"
                  : "border-edge bg-surface-overlay text-content-muted"
            }`}
          >
            <option value="">Unassigned</option>
            <option value={ALL_ASSIGNEE}>Everyone</option>
            {roster.map((r) => (
              <option key={r.user_id} value={r.user_id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

interface Draft {
  dayIndex: number;
  title: string;
  notes: string;
  todos: string;
}

function draftFrom(activity: Activity): Draft {
  return {
    dayIndex: activity.day_index,
    title: activity.title,
    notes: activity.notes ?? "",
    todos: parseTodos(activity.todos)
      .map((item) => item.text)
      .join("\n"),
  };
}

export default function ActivitiesSection({
  tripId,
  onChange,
  tripStartDate,
}: {
  tripId: number;
  onChange?: () => void;
  tripStartDate?: string | null;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [roster, setRoster] = useState<Collaborator[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dayIndex, setDayIndex] = useState(1);
  const [notes, setNotes] = useState("");
  const [todos, setTodos] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  function refresh() {
    listActivities(tripId).then(setActivities);
    listCollaborators(tripId).then(setRoster);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const todoItems = bulletLines(todos).map((text) => ({ text, done: false, assignedTo: null }));
      await createActivity(tripId, {
        title,
        day_index: dayIndex,
        notes: notes.trim() || null,
        todos: serializeTodos(todoItems),
      });
      setTitle("");
      setNotes("");
      setTodos("");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteActivity(id);
    refresh();
    onChange?.();
  }

  async function saveEdit(activity: Activity) {
    if (!draft) return;
    setSaving(true);
    try {
      const reconciled = reconcileTodos(parseTodos(activity.todos), bulletLines(draft.todos));
      await updateActivity(activity.id, {
        title: draft.title,
        day_index: draft.dayIndex,
        notes: draft.notes.trim() || null,
        todos: serializeTodos(reconciled),
      });
      setEditingId(null);
      setDraft(null);
      refresh();
      onChange?.();
    } finally {
      setSaving(false);
    }
  }

  const groupedByDay = Array.from(
    activities
      .reduce((map, activity) => {
        const list = map.get(activity.day_index) ?? [];
        list.push(activity);
        map.set(activity.day_index, list);
        return map;
      }, new Map<number, Activity[]>())
      .entries(),
  ).sort(([a], [b]) => a - b);

  return (
    <Section
      glyph={SECTION_META.timeline.glyph}
      title="Timeline"
      tone={SECTION_META.timeline.tone}
      count={groupedByDay.length}
      actions={
        !showAdd && (
          <IconButton onClick={() => setShowAdd(true)} title="Add activity" icon="add" />
        )
      }
    >
      {showAdd && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Day #">
              <input
                type="number"
                min={1}
                autoFocus
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                className={`${inputClass} w-20`}
              />
            </Field>
            <div className="flex-1">
              <Field label="Activity">
                <input
                  type="text"
                  placeholder="e.g. Ride the DBBB off-road"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Details (one bullet per line)">
              <textarea
                rows={3}
                placeholder={"Nada Tunnel\nNatural Bridge hike"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="To-do (one item per line)">
              <textarea
                rows={3}
                placeholder={"Book Lil Abner's for night 2\nCheck tire pressure"}
                value={todos}
                onChange={(e) => setTodos(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </AddForm>
      )}

      {groupedByDay.length === 0 ? (
        <EmptyState glyph="🗓️" message="No days planned yet. Add the first activity." />
      ) : (
        <div className="flex flex-col gap-3">
          {groupedByDay.map(([day, dayActivities]) => {
            const tone = dayTone(day);
            const date = dayDate(tripStartDate, day);
            return (
              <div
                key={day}
                className={`overflow-hidden rounded-card border border-edge border-l-4 bg-surface-raised ${TONE_EDGE[tone]}`}
              >
                <div
                  className={`flex items-center gap-2 border-b border-edge px-3 py-2 text-xs font-semibold uppercase tracking-wider ${TONE_SOFT[tone]}`}
                >
                  <span>Day {day}</span>
                  {date && (
                    <span className="font-normal normal-case opacity-80">{date}</span>
                  )}
                </div>

                {/*
                 * One grid rather than a table, so the same markup is columns
                 * on a laptop and a stack on a phone. A timeline you can't
                 * read at a trailhead isn't much use, and a horizontally
                 * scrolling table is exactly that.
                 */}
                <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.5fr)] gap-2 border-b border-edge px-2 py-1.5 text-[11px] uppercase tracking-wider text-content-subtle sm:grid">
                  <span />
                  <span className="font-medium">Activity</span>
                  <span className="font-medium">Details</span>
                  <span className="font-medium">To-do</span>
                </div>

                <div className="divide-y divide-edge">
                  {dayActivities.map((activity) =>
                    editingId === activity.id && draft ? (
                      <div
                        key={activity.id}
                        className="grid gap-2 p-2 sm:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.5fr)]"
                      >
                        <div className="flex gap-1 sm:flex-col sm:items-center">
                          <IconButton
                            onClick={() => saveEdit(activity)}
                            disabled={saving}
                            title="Save"
                            variant="confirm"
                            icon="confirm"
                          />
                          <IconButton
                            onClick={() => setEditingId(null)}
                            title="Cancel"
                            icon="close"
                          />
                        </div>
                        <div className="flex gap-1.5 sm:flex-col">
                          <input
                            type="number"
                            min={1}
                            aria-label="Day number"
                            value={draft.dayIndex}
                            onChange={(e) =>
                              setDraft({ ...draft, dayIndex: Number(e.target.value) })
                            }
                            className={`${inputClass} w-14 shrink-0 py-1 text-xs sm:w-full`}
                          />
                          <input
                            type="text"
                            aria-label="Activity"
                            value={draft.title}
                            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                            className={`${inputClass} py-1 text-xs`}
                          />
                        </div>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] uppercase tracking-wider text-content-subtle sm:hidden">
                            Details
                          </span>
                          <textarea
                            rows={3}
                            value={draft.notes}
                            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                            className={`${inputClass} py-1 text-xs`}
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] uppercase tracking-wider text-content-subtle sm:hidden">
                            To-do
                          </span>
                          <textarea
                            rows={3}
                            value={draft.todos}
                            onChange={(e) => setDraft({ ...draft, todos: e.target.value })}
                            className={`${inputClass} py-1 text-xs`}
                          />
                        </label>
                      </div>
                    ) : (
                      <div
                        key={activity.id}
                        className="group grid gap-2 p-2 text-sm transition-colors hover:bg-surface-overlay/50 sm:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.5fr)]"
                      >
                        {/* Controls are always visible on touch. There is no
                            hover to reveal them with. */}
                        <div className="order-2 flex gap-1 opacity-100 transition-opacity sm:order-none sm:flex-col sm:items-center sm:opacity-0 sm:focus-within:opacity-100 sm:group-hover:opacity-100">
                          <IconButton
                            onClick={() => {
                              setEditingId(activity.id);
                              setDraft(draftFrom(activity));
                            }}
                            title="Edit"
                            icon="edit"
                          />
                          <IconButton
                            onClick={() => handleDelete(activity.id)}
                            title="Remove"
                            variant="danger"
                            icon="remove"
                          />
                        </div>
                        <p className="order-1 font-medium text-content sm:order-none">
                          {activity.title}
                        </p>
                        <div className="order-3 text-content-muted sm:order-none">
                          <p className="mb-0.5 text-[11px] uppercase tracking-wider text-content-subtle sm:hidden">
                            Details
                          </p>
                          <BulletList text={activity.notes} />
                        </div>
                        <div className="order-4 text-content-muted sm:order-none">
                          <p className="mb-0.5 text-[11px] uppercase tracking-wider text-content-subtle sm:hidden">
                            To-do
                          </p>
                          <TodoList activity={activity} roster={roster} onSaved={refresh} />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
