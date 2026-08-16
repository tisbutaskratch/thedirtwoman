import { useEffect, useState } from "react";
import { createNote, deleteNote, listNotes } from "@/api/trips";
import type { Note } from "@/api/types";

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
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notes</h2>
        {!editing && (
          <button
            onClick={startEdit}
            title="Edit"
            className="text-slate-500 hover:text-emerald-300"
          >
            ✎
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            rows={6}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={"One note per line\ne.g. Red River Gorge area is a lot of fun"}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              title="Save"
              className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              ✓
            </button>
            <button
              onClick={() => setEditing(false)}
              title="Cancel"
              className="text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          </div>
        </div>
      ) : notes.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          {notes.map((note) => (
            <li key={note.id} className="group flex items-start justify-between gap-2">
              <span>{note.body}</span>
              <button
                onClick={() => handleRemoveLine(note.id)}
                title="Remove"
                className="shrink-0 text-slate-600 hover:text-red-400"
              >
                −
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No notes yet.</p>
      )}
    </section>
  );
}
