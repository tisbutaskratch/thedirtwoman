import { apiRequest } from "@/api/client";
import type { JournalEntry, JournalEntryCreate, JournalEntryUpdate } from "@/api/types";

export const listJournal = (tripId: number) =>
  apiRequest<JournalEntry[]>(`/trips/${tripId}/journal`);

export const createJournalEntry = (tripId: number, payload: JournalEntryCreate) =>
  apiRequest<JournalEntry>(`/trips/${tripId}/journal`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateJournalEntry = (id: number, payload: JournalEntryUpdate) =>
  apiRequest<JournalEntry>(`/journal/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteJournalEntry = (id: number) =>
  apiRequest<void>(`/journal/${id}`, { method: "DELETE" });
