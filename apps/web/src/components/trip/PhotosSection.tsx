import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  attachmentUrl,
  deleteAttachment,
  downloadAttachment,
  listPhotos,
  uploadPhoto,
} from "@/api/attachments";
import type { Attachment } from "@/api/types";
import { AddForm, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

export default function PhotosSection({ tripId }: { tripId: number }) {
  const [photos, setPhotos] = useState<Attachment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewing, setViewing] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function refresh() {
    listPhotos(tripId).then(setPhotos);
  }

  useEffect(refresh, [tripId]);

  // Escape closes the lightbox. Expected behaviour for any modal overlay.
  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewing(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!title.trim() || !file) return;
    setSubmitting(true);
    try {
      await uploadPhoto(tripId, title, description, file);
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
    setViewing(null);
    refresh();
  }

  return (
    <Section
      glyph={SECTION_META.screenshots.glyph}
      title="Screenshots"
      tone={SECTION_META.screenshots.tone}
      count={photos.length}
      actions={
        !showAdd && (
          <IconButton onClick={() => setShowAdd(true)} title="Add screenshot" icon="add" />
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
          <div className="grid gap-2 sm:grid-cols-2">
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
              placeholder="Short summary (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="text-sm text-content-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-sunken file:px-3 file:py-1.5 file:text-xs file:text-content"
          />
        </AddForm>
      )}

      {photos.length === 0 ? (
        <EmptyState glyph="📷" message="No screenshots yet." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-card border border-edge bg-surface-raised transition-all hover:border-accent hover:shadow-lg"
            >
              <button
                onClick={() => setViewing(photo)}
                className="block w-full text-left"
                title={`Open ${photo.title}`}
              >
                <img
                  src={attachmentUrl(photo)}
                  alt={photo.title}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="block truncate px-2 py-1.5 text-xs text-content-muted group-hover:text-accent">
                  {photo.title}
                </span>
              </button>

              {/*
               * Saving a screenshot shouldn't mean opening it first. Always
               * visible on touch, where there is no hover to reveal it.
               */}
              <span className="absolute right-1 top-1 rounded-md bg-surface/85 backdrop-blur transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <IconButton
                  onClick={() => downloadAttachment(photo)}
                  title={`Download ${photo.original_filename}`}
                  icon="download"
                />
              </span>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div
          onClick={() => setViewing(null)}
          role="dialog"
          aria-modal
          aria-label={viewing.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full max-w-4xl flex-col overflow-hidden rounded-card border border-edge bg-surface-raised"
          >
            <img
              src={attachmentUrl(viewing)}
              alt={viewing.title}
              className="max-h-[70vh] w-full object-contain"
            />
            <div className="flex items-start justify-between gap-4 p-4">
              <div>
                <h3 className="font-semibold text-content">{viewing.title}</h3>
                {viewing.description && (
                  <p className="mt-1 text-sm text-content-muted">{viewing.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton
                  onClick={() => downloadAttachment(viewing)}
                  title={`Download ${viewing.original_filename}`}
                  icon="download"
                />
                <IconButton
                  onClick={() => handleDelete(viewing.id)}
                  title="Delete"
                  variant="danger"
                  icon="remove"
                />
                <IconButton onClick={() => setViewing(null)} title="Close" icon="close" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
