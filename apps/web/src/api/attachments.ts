import { API_BASE, apiRequest } from "@/api/client";
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
