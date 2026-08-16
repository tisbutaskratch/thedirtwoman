import { useEffect, useState } from "react";
import { createNote, deleteNote, listNotes } from "@/api/trips";
import type { Note } from "@/api/types";
import { EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

function bulletLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function NotesSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    listNotes(tripId).then(setNotes);
  }

  useEffect(refresh, [tripId]);

  function startEdit() {
    setDraft(notes.map((n) => n.body).join("\n"));
    setEditing(true);
  }

  async function handleRemoveLine(id: number) {
    await deleteNote(id);
    refresh();
    onChange?.();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const newLines = bulletLines(draft);
      const existingBodies = new Set(notes.map((n) => n.body));
      const newBodySet = new Set(newLines);

      const toDelete = notes.filter((n) => !newBodySet.has(n.body));
      const toCreate = newLines.filter((line) => !existingBodies.has(line));

      await Promise.all([
        ...toDelete.map((n) => deleteNote(n.id)),
        ...toCreate.map((line) => createNote(tripId, { body: line })),
      ]);

      setEditing(false);
      refresh();
      onChange?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      icon={SECTION_META.notes.icon}
      title="Notes"
      tone={SECTION_META.notes.tone}
      count={notes.length}
      actions={
        !editing && (
          <IconButton onClick={startEdit} title="Edit notes">
            ✎
          </IconButton>
        )
      }
    >
      {editing ? (
        <div className="flex flex-col gap-3 rounded-card border border-edge bg-surface-overlay p-4">
          <div className="flex justify-end">
            <IconButton onClick={() => setEditing(false)} title="Cancel">
              ×
            </IconButton>
          </div>
          <textarea
            rows={7}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={"One note per line\ne.g. Red River Gorge area is a lot of fun"}
            className={inputClass}
          />
          <div className="flex justify-end">
            <IconButton
              onClick={handleSave}
              title="Save"
              variant="confirm"
              disabled={saving}
            >
              ✓
            </IconButton>
          </div>
        </div>
      ) : notes.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start justify-between gap-2 rounded-md border border-edge bg-surface-raised px-3 py-2"
            >
              <span className="text-sm leading-relaxed text-content-muted">{note.body}</span>
              <IconButton
                onClick={() => handleRemoveLine(note.id)}
                title="Remove"
                variant="danger"
              >
                −
              </IconButton>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="📝" message="No notes yet." />
      )}
    </Section>
  );
}
