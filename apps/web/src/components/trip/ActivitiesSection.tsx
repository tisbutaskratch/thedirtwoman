import { useEffect, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createActivity, deleteActivity, listActivities, updateActivity } from "@/api/trips";
import type { Activity, Collaborator } from "@/api/types";

const DAY_COLORS = [
  { badge: "border-emerald-800 bg-emerald-950/40 text-emerald-300", accent: "border-l-emerald-600" },
  { badge: "border-sky-800 bg-sky-950/40 text-sky-300", accent: "border-l-sky-600" },
  { badge: "border-violet-800 bg-violet-950/40 text-violet-300", accent: "border-l-violet-600" },
  { badge: "border-amber-800 bg-amber-950/40 text-amber-300", accent: "border-l-amber-600" },
  { badge: "border-rose-800 bg-rose-950/40 text-rose-300", accent: "border-l-rose-600" },
  { badge: "border-cyan-800 bg-cyan-950/40 text-cyan-300", accent: "border-l-cyan-600" },
  { badge: "border-orange-800 bg-orange-950/40 text-orange-300", accent: "border-l-orange-600" },
  { badge: "border-fuchsia-800 bg-fuchsia-950/40 text-fuchsia-300", accent: "border-l-fuchsia-600" },
];

function dayColors(dayIndex: number) {
  const i = ((dayIndex - 1) % DAY_COLORS.length + DAY_COLORS.length) % DAY_COLORS.length;
  return DAY_COLORS[i];
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
  if (lines.length === 0) return <span className="text-slate-600">—</span>;
  return (
    <ul className="list-disc space-y-0.5 pl-4">
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

  if (items.length === 0) return <span className="text-slate-600">—</span>;

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
          <span className={item.done ? "text-slate-600 line-through" : ""}>{item.text}</span>
          <select
            value={item.assignedTo ?? ""}
            onChange={(e) => assign(i, e.target.value)}
            className="ml-1 rounded-full border border-slate-700 bg-slate-800/60 px-1.5 py-0 text-[11px] text-slate-400 outline-none"
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

  function startEdit(activity: Activity) {
    setEditingId(activity.id);
    setDraft(draftFrom(activity));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit(activity: Activity) {
    if (!draft) return;
    setSaving(true);
    try {
      const existing = parseTodos(activity.todos);
      const reconciled = reconcileTodos(existing, bulletLines(draft.todos));
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
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Timeline</h2>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            title="Add activity"
            className="text-slate-500 hover:text-emerald-300"
          >
            +
          </button>
        )}
      </div>

      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
        >
          <div className="flex items-start justify-end">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              title="Close"
              className="text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Day #</span>
              <input
                type="number"
                min={1}
                autoFocus
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                className="w-20 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-slate-500">Activity</span>
              <input
                type="text"
                placeholder="e.g. Ride the DBBB off-road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-slate-500">Details (one bullet per line, optional)</span>
              <textarea
                rows={2}
                placeholder={"Nada Tunnel\nNatural Bridge hike"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-slate-500">To-Do (one item per line, optional)</span>
              <textarea
                rows={2}
                placeholder={"Book Lil Abner's for night 2\nCheck tire pressure"}
                value={todos}
                onChange={(e) => setTodos(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            title="Add"
            className="w-fit text-xl text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
          >
            ✓
          </button>
        </form>
      )}

      {groupedByDay.length === 0 && <p className="text-sm text-slate-500">No activities yet.</p>}

      <div className="flex flex-col gap-3">
        {groupedByDay.map(([day, dayActivities]) => {
          const colors = dayColors(day);
          const date = dayDate(tripStartDate, day);
          return (
            <div
              key={day}
              className={`overflow-hidden rounded-md border border-slate-800 border-l-4 ${colors.accent}`}
            >
              <div
                className={`flex items-center justify-between border-b border-slate-800 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest ${colors.badge}`}
              >
                <span>
                  Day {day}
                  {date && <span className="ml-2 font-normal normal-case text-slate-400">{date}</span>}
                </span>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-t border-slate-800/60 text-left text-xs uppercase tracking-wider text-slate-600">
                    <th className="w-10 px-2 py-1.5" />
                    <th className="w-1/4 px-3 py-1.5 font-medium">Activity</th>
                    <th className="px-3 py-1.5 font-medium">Details</th>
                    <th className="px-3 py-1.5 font-medium">To-Do</th>
                  </tr>
                </thead>
                <tbody>
                  {dayActivities.map((activity) =>
                    editingId === activity.id && draft ? (
                      <tr key={activity.id} className="border-t border-slate-800/60 align-top">
                        <td className="px-2 py-2">
                          <div className="flex flex-col items-center gap-1.5">
                            <button
                              onClick={() => saveEdit(activity)}
                              disabled={saving}
                              title="Save"
                              className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEdit}
                              title="Cancel"
                              className="text-slate-500 hover:text-slate-300"
                            >
                              ✕
                            </button>
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
                              className="w-16 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                            />
                            <input
                              type="text"
                              value={draft.title}
                              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <textarea
                            rows={3}
                            value={draft.notes}
                            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <textarea
                            rows={3}
                            value={draft.todos}
                            onChange={(e) => setDraft({ ...draft, todos: e.target.value })}
                            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                          />
                        </td>
                      </tr>
                    ) : (
                      <tr key={activity.id} className="border-t border-slate-800/60 align-top">
                        <td className="px-2 py-2">
                          <div className="flex flex-col items-center gap-1.5">
                            <button
                              onClick={() => startEdit(activity)}
                              title="Edit"
                              className="text-slate-500 hover:text-emerald-300"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDelete(activity.id)}
                              title="Remove"
                              className="text-slate-600 hover:text-red-400"
                            >
                              −
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-100">
                          {activity.title}
                          {activity.start_time && (
                            <div className="mt-0.5 text-xs font-normal text-slate-500">
                              {new Date(activity.start_time).toLocaleTimeString(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          <BulletList text={activity.notes} />
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          <TodoList activity={activity} roster={roster} onSaved={refresh} />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </section>
  );
}
