import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createTask, deleteTask, listTasks, updateTask } from "@/api/tasks";
import type { Collaborator, Task } from "@/api/types";
import { AddForm, Badge, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

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
  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <Section
      icon={SECTION_META.tasks.icon}
      title="Prep checklist"
      tone={SECTION_META.tasks.tone}
      count={remaining}
      actions={
        !showAdd && (
          <IconButton onClick={() => setShowAdd(true)} title="Add task">
            +
          </IconButton>
        )
      }
    >
      {showAdd && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          <input
            type="text"
            autoFocus
            placeholder="Task (e.g. book campsite)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={`${inputClass} flex-1`}
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
              className={`${inputClass} flex-1`}
            />
          </div>
        </AddForm>
      )}

      {tasks.length === 0 ? (
        <EmptyState icon="✅" message="No prep tasks yet." />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {sorted.map((task) => (
            <li
              key={task.id}
              className="group flex items-start gap-2.5 rounded-md border border-edge bg-surface-raised px-3 py-2"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleDone(task)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500"
              />
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <span
                  className={
                    task.done ? "text-sm text-content-subtle line-through" : "text-sm text-content"
                  }
                >
                  {task.title}
                </span>
                {task.assigned_to_user_id !== null && (
                  <Badge tone="cyan">
                    {nameByUserId.get(task.assigned_to_user_id) ?? "Someone"}
                  </Badge>
                )}
                {task.due_date && (
                  <span className="text-xs text-content-subtle">Due {task.due_date}</span>
                )}
              </div>
              <IconButton onClick={() => handleDelete(task.id)} title="Remove" variant="danger">
                −
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
