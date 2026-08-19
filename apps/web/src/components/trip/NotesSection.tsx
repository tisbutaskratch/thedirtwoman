import { useEffect, useState, type FormEvent } from "react";
import { createNote, deleteNote, listNotes, updateNote } from "@/api/trips";
import type { Note } from "@/api/types";
import { AddForm, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

export default function NotesSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  function refresh() {
    listNotes(tripId).then(setNotes);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await createNote(tripId, { body: body.trim() });
      setBody("");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit(id: number) {
    if (!draft.trim()) return;
    await updateNote(id, { body: draft.trim() });
    setEditingId(null);
    refresh();
    onChange?.();
  }

  async function handleDelete(id: number) {
    await deleteNote(id);
    refresh();
    onChange?.();
  }

  return (
    <Section
      glyph={SECTION_META.notes.glyph}
      title="Notes"
      tone={SECTION_META.notes.tone}
      count={notes.length}
      actions={
        !showAdd && <IconButton onClick={() => setShowAdd(true)} title="Add note" icon="add" />
      }
    >
      {showAdd && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          <textarea
            rows={2}
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. Red River Gorge area is a lot of fun"
            className={inputClass}
          />
        </AddForm>
      )}

      {notes.length === 0 ? (
        <EmptyState glyph="📝" message="No notes yet." />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {notes.map((note) =>
            editingId === note.id ? (
              <li
                key={note.id}
                className="flex flex-col gap-1.5 rounded-md border border-edge bg-surface-overlay p-2"
              >
                <textarea
                  rows={2}
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className={`${inputClass} py-1 text-sm`}
                />
                <div className="flex justify-end gap-1">
                  <IconButton onClick={() => setEditingId(null)} title="Cancel" icon="close" />
                  <IconButton
                    onClick={() => saveEdit(note.id)}
                    title="Save"
                    variant="confirm"
                    icon="confirm"
                    size={19}
                  />
                </div>
              </li>
            ) : (
              <li
                key={note.id}
                className="group flex items-start gap-2 rounded-md border border-edge bg-surface-raised px-3 py-2"
              >
                <span className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
                  {note.body}
                </span>
                <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <IconButton
                    onClick={() => {
                      setEditingId(note.id);
                      setDraft(note.body);
                    }}
                    title="Edit"
                    icon="edit"
                  />
                  <IconButton
                    onClick={() => handleDelete(note.id)}
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
