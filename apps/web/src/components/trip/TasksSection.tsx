import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createTask, deleteTask, listTasks, updateTask } from "@/api/tasks";
import type { Collaborator, Task } from "@/api/types";

export default function TasksSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roster, setRoster] = useState<Collaborator[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listTasks(tripId).then(setTasks);
    listCollaborators(tripId).then(setRoster);
  }

  useEffect(refresh, [tripId]);

  const nameByUserId = useMemo(() => {
    const map = new Map<number, string>();
    roster.forEach((c) => map.set(c.user_id, c.name));
    return map;
  }, [roster]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createTask(tripId, {
        title,
        assigned_to_user_id: assignedTo ? Number(assignedTo) : null,
        due_date: dueDate || null,
      });
      setTitle("");
      setAssignedTo("");
      setDueDate("");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDone(task: Task) {
    await updateTask(task.id, { done: !task.done });
    refresh();
    onChange?.();
  }

  async function handleDelete(id: number) {
    await deleteTask(id);
    refresh();
    onChange?.();
  }

  const sorted = [...tasks].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Prep checklist</h2>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            title="Add task"
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
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              title="Close"
              className="text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Task (e.g. book campsite)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
            />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
            >
              <option value="">Unassigned</option>
              {roster.map((c) => (
                <option key={c.user_id} value={c.user_id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={submitting}
              title="Add"
              className="text-xl text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              ✓
            </button>
          </div>
        </form>
      )}

      <ul className="flex flex-col gap-2">
        {sorted.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 rounded-md border border-slate-800 px-4 py-2"
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleDone(task)}
              className="mt-0.5 h-4 w-4 accent-emerald-500"
            />
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <span className={task.done ? "text-slate-500 line-through" : "text-slate-100"}>
                {task.title}
              </span>
              {task.assigned_to_user_id !== null && (
                <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">
                  {nameByUserId.get(task.assigned_to_user_id) ?? "Someone"}
                </span>
              )}
              {task.due_date && <span className="text-xs text-slate-500">Due {task.due_date}</span>}
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              title="Remove"
              className="shrink-0 text-slate-600 hover:text-red-400"
            >
              −
            </button>
          </li>
        ))}
        {tasks.length === 0 && <p className="text-sm text-slate-500">No prep tasks yet.</p>}
      </ul>
    </section>
  );
}
