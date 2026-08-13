import { useEffect, useState, type FormEvent } from "react";
import { createNote, deleteNote, listNotes } from "@/api/trips";
import type { Note } from "@/api/types";

export default function NotesSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listNotes(tripId).then(setNotes);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await createNote(tripId, { body });
      setBody("");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteNote(id);
    refresh();
    onChange?.();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Notes</h2>
      <ul className="flex flex-col gap-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className="flex items-start justify-between rounded-md border border-slate-800 px-4 py-2"
          >
            <span className="text-sm text-slate-300">{note.body}</span>
            <button
              onClick={() => handleDelete(note.id)}
              className="ml-3 shrink-0 text-xs text-slate-500 hover:text-red-400"
            >
              Remove
            </button>
          </li>
        ))}
        {notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a note"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  );
}
