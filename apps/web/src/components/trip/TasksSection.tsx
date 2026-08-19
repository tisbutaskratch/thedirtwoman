import { useEffect, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createTask, deleteTask, listTasks, updateTask } from "@/api/tasks";
import type { Collaborator, RequiredLevel, Task } from "@/api/types";
import { AddForm, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import AssigneeSelect from "@/components/trip/AssigneeSelect";
import RequiredLevelChip from "@/components/trip/RequiredLevelChip";
import { assigneeValue, assignmentPayload } from "@/lib/assignment";
import { SECTION_META } from "@/lib/tripTypes";

interface Draft {
  title: string;
  assignedTo: string;
  dueDate: string;
}

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
  const [requiredLevel, setRequiredLevel] = useState<RequiredLevel>("required");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  function refresh() {
    listTasks(tripId).then(setTasks);
    listCollaborators(tripId).then(setRoster);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createTask(tripId, {
        title,
        required_level: requiredLevel,
        ...assignmentPayload(assignedTo),
        due_date: dueDate || null,
      });
      setTitle("");
      setAssignedTo("");
      setDueDate("");
      setRequiredLevel("required");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      assignedTo: assigneeValue(task),
      dueDate: task.due_date ?? "",
    });
  }

  async function saveEdit(id: number) {
    if (!draft || !draft.title.trim()) return;
    await updateTask(id, {
      title: draft.title,
      ...assignmentPayload(draft.assignedTo),
      due_date: draft.dueDate || null,
    });
    setEditingId(null);
    setDraft(null);
    refresh();
    onChange?.();
  }

  async function patch(id: number, updates: Parameters<typeof updateTask>[1]) {
    await updateTask(id, updates);
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
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Section
      glyph={SECTION_META.tasks.glyph}
      title="Prep checklist"
      tone={SECTION_META.tasks.tone}
      count={tasks.length}
      meta={tasks.length > 0 ? `${remaining} left` : undefined}
      actions={
        !showAdd && <IconButton onClick={() => setShowAdd(true)} title="Add task" icon="add" />
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
          {/* Grid tracks rather than flex-1: the inputs are w-full, so the
              track is what decides their width. */}
          <div className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)]">
            <select
              value={requiredLevel}
              aria-label="Required level"
              onChange={(e) => setRequiredLevel(e.target.value as RequiredLevel)}
              className={inputClass}
            >
              <option value="required">Required</option>
              <option value="optional">Optional</option>
            </select>
            <AssigneeSelect value={assignedTo} onChange={setAssignedTo} roster={roster} />
            <input
              type="date"
              aria-label="Due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </AddForm>
      )}

      {tasks.length === 0 ? (
        <EmptyState glyph="✅" message="No prep tasks yet." />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {sorted.map((task) =>
            editingId === task.id && draft ? (
              <li
                key={task.id}
                className="flex flex-col gap-1.5 rounded-md border border-edge bg-surface-overlay p-2"
              >
                <input
                  type="text"
                  autoFocus
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className={`${inputClass} py-1 text-xs`}
                />
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <AssigneeSelect
                    value={draft.assignedTo}
                    onChange={(v) => setDraft({ ...draft, assignedTo: v })}
                    roster={roster}
                    compact
                  />
                  <input
                    type="date"
                    aria-label="Due date"
                    value={draft.dueDate}
                    onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                    className={`${inputClass} py-1 text-xs`}
                  />
                </div>
                <div className="flex justify-end gap-1">
                  <IconButton onClick={() => setEditingId(null)} title="Cancel" icon="close" />
                  <IconButton
                    onClick={() => saveEdit(task.id)}
                    title="Save"
                    variant="confirm"
                    icon="confirm"
                    size={19}
                  />
                </div>
              </li>
            ) : (
              <li
                key={task.id}
                className="group flex items-start gap-2.5 rounded-md border border-edge bg-surface-raised px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => patch(task.id, { done: !task.done })}
                  className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      task.done ? "text-sm text-content-subtle line-through" : "text-sm text-content"
                    }
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <RequiredLevelChip
                      value={task.required_level}
                      onChange={(level) => patch(task.id, { required_level: level })}
                    />
                    <AssigneeSelect
                      value={assigneeValue(task)}
                      onChange={(v) => patch(task.id, assignmentPayload(v))}
                      roster={roster}
                      variant="chip"
                      highlighted={task.assigned_to_all}
                    />
                    {task.due_date && (
                      <span
                        className={`text-xs ${
                          !task.done && task.due_date < today
                            ? "font-medium text-rose-400"
                            : "text-content-subtle"
                        }`}
                      >
                        Due {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <IconButton onClick={() => startEdit(task)} title="Edit" icon="edit" />
                  <IconButton
                    onClick={() => handleDelete(task.id)}
                    title="Remove"
                    variant="danger"
                    icon="remove"
                  />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </Section>
  );
}
