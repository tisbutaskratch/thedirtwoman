import { useEffect, useRef, useState, type FormEvent } from "react";
import { attachmentUrl, downloadAttachment, deleteAttachment, listFiles, uploadFile } from "@/api/attachments";
import type { Attachment } from "@/api/types";
import { AddForm, Emoji, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

/** A small visual cue so a GPX doesn't look like a PDF at a glance. */
function fileGlyph(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "gpx" || ext === "kml") return "🗺️";
  if (ext === "pdf") return "📄";
  if (ext === "csv" || ext === "xlsx") return "📊";
  if (ext === "zip") return "🗜️";
  return "📎";
}

export default function FilesSection({ tripId }: { tripId: number }) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function refresh() {
    listFiles(tripId).then(setFiles);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!title.trim() || !file) return;
    setSubmitting(true);
    try {
      await uploadFile(tripId, title, description, file);
      setTitle("");
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteAttachment(id);
    refresh();
  }

  return (
    <Section
      glyph={SECTION_META.files.glyph}
      title="Files"
      tone={SECTION_META.files.tone}
      count={files.length}
      actions={
        !showAdd && (
          <IconButton onClick={() => setShowAdd(true)} title="Add file" icon="add" />
        )
      }
    >
      {showAdd && (
        <AddForm
          onSubmit={handleSubmit}
          onClose={() => setShowAdd(false)}
          submitting={submitting}
          submitTitle="Upload"
        >
          <input
            type="text"
            autoFocus
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="text-sm text-content-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-sunken file:px-3 file:py-1.5 file:text-xs file:text-content"
          />
        </AddForm>
      )}

      {files.length === 0 ? (
        <EmptyState glyph="📎" message="No files yet." />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-2.5 rounded-md border border-edge bg-surface-raised px-3 py-2"
            >
              <Emoji glyph={fileGlyph(file.original_filename)} size="md" />
              <a
                href={attachmentUrl(file)}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1"
              >
                <span className="block truncate text-sm text-content hover:text-accent">
                  {file.title}
                </span>
                <span className="block truncate text-xs text-content-subtle">
                  {file.description ? `${file.description} · ` : ""}
                  {file.original_filename}
                </span>
              </a>
              <IconButton
                onClick={() => downloadAttachment(file)}
                title={`Download ${file.original_filename}`}
                icon="download"
              />
              <IconButton
                onClick={() => handleDelete(file.id)}
                title="Remove"
                variant="danger"
                icon="remove"
              />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
