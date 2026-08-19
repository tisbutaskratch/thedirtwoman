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

export const attachmentUrl = (attachment: Attachment) =>
  absolute(attachment.url) ? attachment.url : `${API_BASE}${attachment.url}`;

/** Signed object-storage URLs are absolute; local development paths are not. */
const absolute = (url: string) => /^https?:\/\//.test(url);

/**
 * Save an attachment under its original filename.
 *
 * Two paths, because the two storage backends name the file differently.
 * Object storage puts the filename in the signed URL itself, so a plain
 * navigation downloads it correctly and no CORS rules are needed on the
 * bucket. Local development has no such header, so there the file is fetched
 * as a blob to make the download attribute stick.
 */
export async function downloadAttachment(attachment: Attachment): Promise<void> {
  if (absolute(attachment.download_url)) {
    const link = document.createElement("a");
    link.href = attachment.download_url;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }

  const response = await fetch(`${API_BASE}${attachment.download_url}`);
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
