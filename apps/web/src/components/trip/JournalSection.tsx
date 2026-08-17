import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createJournalEntry,
  deleteJournalEntry,
  listJournal,
  updateJournalEntry,
} from "@/api/journal";
import type { JournalEntry } from "@/api/types";
import Critter from "@/art/critters";
import {
  AddForm,
  Badge,
  EmptyState,
  Icon,
  IconButton,
  Section,
  inputClass,
} from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

/** Today in the user's own timezone, as the yyyy-mm-dd a date input wants. */
function today() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatEntryDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * A private diary for this trip.
 *
 * Private by default and with no way to share it, which is the point: a
 * journal that might become visible is one people write differently. The
 * server only ever returns your own entries, so the privacy is real rather
 * than a filter applied on the way out.
 *
 * Entries are dated and shown newest first, which is how every journal
 * anyone has kept on paper works. The date is what you're writing *about*,
 * so it defaults to today but stays editable: nobody writes up a wet
 * afternoon until they're dry.
 */
export default function JournalSection({ tripId }: { tripId: number }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState(today());
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ entry_date: "", body: "" });

  function refresh() {
    listJournal(tripId).then(setEntries);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await createJournalEntry(tripId, { entry_date: date, body: body.trim() });
      setBody("");
      setDate(today());
      setShowAdd(false);
      refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit(id: number) {
    if (!draft.body.trim()) return;
    await updateJournalEntry(id, { entry_date: draft.entry_date, body: draft.body.trim() });
    setEditingId(null);
    refresh();
  }

  async function handleDelete(id: number) {
    await deleteJournalEntry(id);
    refresh();
  }

  // Several entries can share a day, so they group under one heading rather
  // than repeating the date down the page.
  const byDate = useMemo(() => {
    const groups = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
      groups.set(entry.entry_date, [...(groups.get(entry.entry_date) ?? []), entry]);
    }
    return Array.from(groups.entries());
  }, [entries]);

  return (
    <Section
      glyph={SECTION_META.journal.glyph}
      title="Journal"
      tone={SECTION_META.journal.tone}
      count={entries.length}
      actions={
        !showAdd && <IconButton onClick={() => setShowAdd(true)} title="Write an entry" icon="add" />
      }
    >
      {/* Said plainly and up front, because the whole value of the section
          rests on believing it. */}
      <p className="flex items-center gap-1.5 text-xs text-content-subtle">
        <Icon name="private" size={13} />
        Private to you. Nobody else on this trip can see these, not even collaborators.
      </p>

      {showAdd && (
        <AddForm
          onSubmit={handleSubmit}
          onClose={() => setShowAdd(false)}
          submitting={submitting}
          submitTitle="Save entry"
        >
          <input
            type="date"
            aria-label="Entry date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputClass} sm:w-48`}
          />
          <textarea
            rows={5}
            autoFocus
            placeholder="How was the day?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={inputClass}
          />
        </AddForm>
      )}

      {entries.length === 0 ? (
        <EmptyState glyph="📔" message="No entries yet. Write down how today went." />
      ) : (
        <div className="flex flex-col gap-4">
          {byDate.map(([entryDate, dayEntries]) => (
            <div key={entryDate} className="flex flex-col gap-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-content-subtle">
                {formatEntryDate(entryDate)}
                {dayEntries.length > 1 && (
                  <Badge tone="violet">{dayEntries.length} entries</Badge>
                )}
              </h3>

              {dayEntries.map((entry) =>
                editingId === entry.id ? (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-2 rounded-card border border-edge bg-surface-overlay p-3"
                  >
                    <input
                      type="date"
                      aria-label="Entry date"
                      value={draft.entry_date}
                      onChange={(e) => setDraft({ ...draft, entry_date: e.target.value })}
                      className={`${inputClass} py-1 text-xs sm:w-48`}
                    />
                    <textarea
                      rows={5}
                      autoFocus
                      value={draft.body}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                      className={inputClass}
                    />
                    <div className="flex justify-end gap-1">
                      <IconButton onClick={() => setEditingId(null)} title="Cancel" icon="close" />
                      <IconButton
                        onClick={() => saveEdit(entry.id)}
                        title="Save"
                        variant="confirm"
                        icon="confirm"
                        size={19}
                      />
                    </div>
                  </div>
                ) : (
                  <article
                    key={entry.id}
                    className="group flex items-start gap-2 rounded-card border border-edge bg-surface-raised p-3"
                  >
                    <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
                      {entry.body}
                    </p>
                    <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:focus-within:opacity-100 sm:group-hover:opacity-100">
                      <IconButton
                        onClick={() => {
                          setEditingId(entry.id);
                          setDraft({ entry_date: entry.entry_date, body: entry.body });
                        }}
                        title="Edit entry"
                        icon="edit"
                      />
                      <IconButton
                        onClick={() => handleDelete(entry.id)}
                        title="Delete entry"
                        variant="danger"
                        icon="remove"
                      />
                    </div>
                  </article>
                ),
              )}
            </div>
          ))}

          {/* A reader for the diary, who can obviously be trusted. */}
          <div className="flex items-center justify-end gap-2 pr-1 text-xs italic text-content-subtle">
            <span>Read by nobody but you</span>
            <Critter name="cat" size={24} className="opacity-80" />
          </div>
        </div>
      )}
    </Section>
  );
}
