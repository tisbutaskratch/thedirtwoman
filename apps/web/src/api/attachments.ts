import { API_BASE, ApiError, apiRequest } from "@/api/client";
import type { Attachment } from "@/api/types";

function buildForm(title: string, description: string, file: File) {
  const form = new FormData();
  form.append("title", title);
  if (description.trim()) form.append("description", description);
  form.append("file", file);
  return form;
}

export const listPhotos = (tripId: number) =>
  apiRequest<Attachment[]>(`/trips/${tripId}/photos`);

export const uploadPhoto = (tripId: number, title: string, description: string, file: File) =>
  apiRequest<Attachment>(`/trips/${tripId}/photos`, {
    method: "POST",
    body: buildForm(title, description, file),
  });

export const listFiles = (tripId: number) => apiRequest<Attachment[]>(`/trips/${tripId}/files`);

export const uploadFile = (tripId: number, title: string, description: string, file: File) =>
  apiRequest<Attachment>(`/trips/${tripId}/files`, {
    method: "POST",
    body: buildForm(title, description, file),
  });

export const deleteAttachment = (id: number) =>
  apiRequest<void>(`/attachments/${id}`, { method: "DELETE" });

export const attachmentUrl = (attachment: Attachment) => `${API_BASE}${attachment.url}`;

/**
 * Save an attachment to disk under its original filename.
 *
 * An `<a download>` won't do: the media host is a different origin from the
 * app, and browsers ignore the download attribute cross-origin — the file
 * just opens in a tab instead. Fetching it as a blob keeps it same-origin at
 * the moment of download, so the filename sticks.
 */
export async function downloadAttachment(attachment: Attachment): Promise<void> {
  const response = await fetch(attachmentUrl(attachment));
  if (!response.ok) throw new ApiError(response.status, "Could not download this file");

  const objectUrl = URL.createObjectURL(await response.blob());
  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = attachment.original_filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
