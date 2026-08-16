import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { createActivity, deleteActivity, listActivities, updateActivity } from "@/api/trips";
import type { Activity } from "@/api/types";

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
}

// todos is stored as a JSON-encoded TodoItem[] so each line can carry its
// own checked state; older rows that predate this (plain newline bullets)
// still parse fine, just as all-unchecked items.
function parseTodos(raw: string | null): TodoItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to legacy plain-text parsing
  }
  return bulletLines(raw).map((text) => ({ text, done: false }));
}

function serializeTodos(items: TodoItem[]): string | null {
  return items.length > 0 ? JSON.stringify(items) : null;
}

function TodoChecklist({ activity, onSaved }: { activity: Activity; onSaved: () => void }) {
  const [items, setItems] = useState<TodoItem[]>(() => parseTodos(activity.todos));
  const [newText, setNewText] = useState("");

  useEffect(() => {
    setItems(parseTodos(activity.todos));
  }, [activity.todos]);

  async function persist(next: TodoItem[]) {
    setItems(next);
    await updateActivity(activity.id, { todos: serializeTodos(next) });
    onSaved();
  }

  function toggle(index: number) {
    const next = items.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    persist(next);
  }

  function remove(index: number) {
    persist(items.filter((_, i) => i !== index));
  }

  function add() {
    if (!newText.trim()) return;
    persist([...items, { text: newText.trim(), done: false }]);
    setNewText("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item, i) => (
        <label key={i} className="flex items-start gap-1.5">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggle(i)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-emerald-500"
          />
          <span className={item.done ? "text-slate-600 line-through" : ""}>{item.text}</span>
          <button
            onClick={() => remove(i)}
            className="ml-1 shrink-0 text-slate-700 hover:text-red-400"
          >
            ✕
          </button>
        </label>
      ))}
      <input
        type="text"
        placeholder="+ add to-do"
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={add}
        className="rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-slate-400 outline-none placeholder:text-slate-700 focus:border-slate-700 focus:bg-slate-900"
      />
    </div>
  );
}

interface Draft {
  dayIndex: number;
  title: string;
  notes: string;
}

function draftFrom(activity: Activity): Draft {
  return {
    dayIndex: activity.day_index,
    title: activity.title,
    notes: activity.notes ?? "",
  };
}

export default function ActivitiesSection({
  tripId,
  onChange,
  tripStartDate,
  dailyTargetMiles,
}: {
  tripId: number;
  onChange?: () => void;
  tripStartDate?: string | null;
  dailyTargetMiles?: number | null;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
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
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const todoItems = bulletLines(todos).map((text) => ({ text, done: false }));
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

  async function saveEdit(id: number) {
    if (!draft) return;
    setSaving(true);
    try {
      await updateActivity(id, {
        title: draft.title,
        day_index: draft.dayIndex,
        notes: draft.notes.trim() || null,
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
      <h2 className="text-xl font-semibold">Timeline</h2>

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
                {dailyTargetMiles && <span className="font-normal">Target: {dailyTargetMiles} mi</span>}
              </div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-t border-slate-800/60 text-left text-xs uppercase tracking-wider text-slate-600">
                    <th className="w-1/4 px-3 py-1.5 font-medium">Activity</th>
                    <th className="px-3 py-1.5 font-medium">Details</th>
                    <th className="px-3 py-1.5 font-medium">To-Do</th>
                    <th className="w-16 px-2 py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {dayActivities.map((activity) =>
                    editingId === activity.id && draft ? (
                      <tr key={activity.id} className="border-t border-slate-800/60 align-top">
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
                        <td className="px-3 py-2 text-xs text-slate-600">
                          Use the checklist to edit to-dos
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() => saveEdit(activity.id)}
                              disabled={saving}
                              className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-xs text-slate-500 hover:text-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={activity.id} className="border-t border-slate-800/60 align-top">
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
                          <TodoChecklist activity={activity} onSaved={refresh} />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() => startEdit(activity)}
                              className="text-xs text-slate-500 hover:text-emerald-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(activity.id)}
                              className="text-xs text-slate-600 hover:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
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

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
      >
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Day #</span>
            <input
              type="number"
              min={1}
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
          className="w-fit rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  );
}
