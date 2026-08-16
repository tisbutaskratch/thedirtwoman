import { useEffect, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createActivity, deleteActivity, listActivities, updateActivity } from "@/api/trips";
import type { Activity, Collaborator } from "@/api/types";
import {
  AddForm,
  EmptyState,
  Field,
  IconButton,
  Section,
  TONE_EDGE,
  TONE_SOFT,
  inputClass,
  type Tone,
} from "@/components/ui";
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

function BulletList({ text }: { text: string | null }) {
  const lines = bulletLines(text);
  if (lines.length === 0) return <span className="text-content-subtle">—</span>;
  return (
    <ul className="list-disc space-y-0.5 pl-4 marker:text-content-subtle">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

interface TodoItem {
  text: string;
  done: boolean;
  assignedTo: number | null;
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
        assignedTo: item.assignedTo ?? null,
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

  async function assign(index: number, userId: string) {
    const next = items.map((item, i) =>
      i === index ? { ...item, assignedTo: userId ? Number(userId) : null } : item,
    );
    await updateActivity(activity.id, { todos: serializeTodos(next) });
    onSaved();
  }

  if (items.length === 0) return <span className="text-content-subtle">—</span>;

  return (
    <div className="flex flex-col gap-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggle(i)}
            className="h-3.5 w-3.5 shrink-0 accent-emerald-500"
          />
          <span className={item.done ? "text-content-subtle line-through" : ""}>{item.text}</span>
          <select
            value={item.assignedTo ?? ""}
            onChange={(e) => assign(i, e.target.value)}
            aria-label="Assign to"
            className="ml-auto rounded-full border border-edge bg-surface-overlay px-1.5 py-0 text-[11px] text-content-muted outline-none"
          >
            <option value="">Unassigned</option>
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
      icon={SECTION_META.timeline.icon}
      title="Timeline"
      tone={SECTION_META.timeline.tone}
      count={groupedByDay.length}
      actions={
        !showAdd && (
          <IconButton onClick={() => setShowAdd(true)} title="Add activity">
            +
          </IconButton>
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
        <EmptyState icon="🗓️" message="No days planned yet — add the first activity." />
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

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wider text-content-subtle">
                        <th className="w-12 px-2 py-1.5" />
                        <th className="w-1/4 px-3 py-1.5 font-medium">Activity</th>
                        <th className="px-3 py-1.5 font-medium">Details</th>
                        <th className="px-3 py-1.5 font-medium">To-do</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayActivities.map((activity) =>
                        editingId === activity.id && draft ? (
                          <tr key={activity.id} className="border-t border-edge align-top">
                            <td className="px-2 py-2">
                              <div className="flex flex-col items-center gap-1">
                                <IconButton
                                  onClick={() => saveEdit(activity)}
                                  disabled={saving}
                                  title="Save"
                                  variant="confirm"
                                >
                                  ✓
                                </IconButton>
                                <IconButton onClick={() => setEditingId(null)} title="Cancel">
                                  ×
                                </IconButton>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-col gap-1">
                                <input
                                  type="number"
                                  min={1}
                                  value={draft.dayIndex}
                                  onChange={(e) =>
                                    setDraft({ ...draft, dayIndex: Number(e.target.value) })
                                  }
                                  className={`${inputClass} w-16 py-1 text-xs`}
                                />
                                <input
                                  type="text"
                                  value={draft.title}
                                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                  className={`${inputClass} py-1 text-xs`}
                                />
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <textarea
                                rows={3}
                                value={draft.notes}
                                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                                className={`${inputClass} py-1 text-xs`}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <textarea
                                rows={3}
                                value={draft.todos}
                                onChange={(e) => setDraft({ ...draft, todos: e.target.value })}
                                className={`${inputClass} py-1 text-xs`}
                              />
                            </td>
                          </tr>
                        ) : (
                          <tr
                            key={activity.id}
                            className="group border-t border-edge align-top transition-colors hover:bg-surface-overlay/50"
                          >
                            <td className="px-2 py-2">
                              <div className="flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <IconButton
                                  onClick={() => {
                                    setEditingId(activity.id);
                                    setDraft(draftFrom(activity));
                                  }}
                                  title="Edit"
                                >
                                  ✎
                                </IconButton>
                                <IconButton
                                  onClick={() => handleDelete(activity.id)}
                                  title="Remove"
                                  variant="danger"
                                >
                                  −
                                </IconButton>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-medium text-content">{activity.title}</td>
                            <td className="px-3 py-2 text-content-muted">
                              <BulletList text={activity.notes} />
                            </td>
                            <td className="px-3 py-2 text-content-muted">
                              <TodoList activity={activity} roster={roster} onSaved={refresh} />
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
