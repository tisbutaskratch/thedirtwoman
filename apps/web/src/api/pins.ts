import { apiRequest } from "@/api/client";
import type { SectionKey } from "@/api/types";

/*
 * What you keep at the top. Both kinds are private view preferences: pinning
 * a shared trip rearranges your dashboard and nobody else's.
 */
export const listPinnedTrips = () => apiRequest<number[]>("/pins/trips");

export const pinTrip = (tripId: number) =>
  apiRequest<void>(`/pins/trips/${tripId}`, { method: "PUT" });

export const unpinTrip = (tripId: number) =>
  apiRequest<void>(`/pins/trips/${tripId}`, { method: "DELETE" });

export const listPinnedSections = () => apiRequest<SectionKey[]>("/pins/sections");

export const pinSection = (section: SectionKey) =>
  apiRequest<void>(`/pins/sections/${section}`, { method: "PUT" });

export const unpinSection = (section: SectionKey) =>
  apiRequest<void>(`/pins/sections/${section}`, { method: "DELETE" });
