import { apiRequest } from "@/api/client";
import type { Contribution, ContributionCreate, ContributionUpdate } from "@/api/types";

export const listContributions = (tripId: number) =>
  apiRequest<Contribution[]>(`/trips/${tripId}/contributions`);

export const createContribution = (tripId: number, payload: ContributionCreate) =>
  apiRequest<Contribution>(`/trips/${tripId}/contributions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateContribution = (id: number, payload: ContributionUpdate) =>
  apiRequest<Contribution>(`/contributions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteContribution = (id: number) =>
  apiRequest<void>(`/contributions/${id}`, { method: "DELETE" });
