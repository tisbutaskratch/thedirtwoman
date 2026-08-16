import { useEffect, useRef, useState, type FormEvent } from "react";
import { attachmentUrl, deleteAttachment, listFiles, uploadFile } from "@/api/attachments";
import type { Attachment } from "@/api/types";

export default function FilesSection({ tripId }: { tripId: number }) {
  const [files, setFiles] = useState<Attachment[]>([]);
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
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Files</h2>
      <ul className="flex flex-col gap-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="flex items-center justify-between gap-3 rounded-md border border-slate-800 px-4 py-2"
          >
            <a
              href={attachmentUrl(file)}
              target="_blank"
              rel="noreferrer"
              download={file.original_filename}
              className="flex-1 truncate"
            >
              <span className="text-sm text-slate-100 hover:text-emerald-300">{file.title}</span>
              {file.description && (
                <span className="ml-2 text-xs text-slate-500">{file.description}</span>
              )}
              <span className="ml-2 text-xs text-slate-600">({file.original_filename})</span>
            </a>
            <button
              onClick={() => handleDelete(file.id)}
              className="shrink-0 text-xs text-slate-500 hover:text-red-400"
            >
              Remove
            </button>
          </li>
        ))}
        {files.length === 0 && <p className="text-sm text-slate-500">No files yet.</p>}
      </ul>
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
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
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
    </section>
  );
}
