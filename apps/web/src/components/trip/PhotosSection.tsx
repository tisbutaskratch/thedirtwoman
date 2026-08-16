import { useEffect, useRef, useState, type FormEvent } from "react";
import { attachmentUrl, deleteAttachment, listPhotos, uploadPhoto } from "@/api/attachments";
import type { Attachment } from "@/api/types";

export default function PhotosSection({ tripId }: { tripId: number }) {
  const [photos, setPhotos] = useState<Attachment[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewing, setViewing] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function refresh() {
    listPhotos(tripId).then(setPhotos);
  }

  useEffect(refresh, [tripId]);

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
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Photos</h2>

      {photos.length === 0 && <p className="text-sm text-slate-500">No photos yet.</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setViewing(photo)}
            className="group flex flex-col overflow-hidden rounded-md border border-slate-800 text-left transition-colors hover:border-emerald-600"
          >
            <img
              src={attachmentUrl(photo)}
              alt={photo.title}
              className="aspect-square w-full object-cover"
            />
            <span className="truncate px-2 py-1.5 text-xs text-slate-300 group-hover:text-emerald-300">
              {photo.title}
            </span>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
      >
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Short summary (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="flex-1 text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:text-slate-200"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </form>

      {viewing && (
        <div
          onClick={() => setViewing(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full max-w-3xl flex-col gap-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-950"
          >
            <img
              src={attachmentUrl(viewing)}
              alt={viewing.title}
              className="max-h-[70vh] w-full object-contain"
            />
            <div className="flex items-start justify-between gap-4 px-4 pb-4">
              <div>
                <h3 className="font-semibold text-slate-100">{viewing.title}</h3>
                {viewing.description && (
                  <p className="mt-1 text-sm text-slate-400">{viewing.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => handleDelete(viewing.id)}
                  className="text-xs text-slate-500 hover:text-red-400"
                >
                  Delete
                </button>
                <button
                  onClick={() => setViewing(null)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
