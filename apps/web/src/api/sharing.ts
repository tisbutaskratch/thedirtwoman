import { apiRequest } from "@/api/client";
import type { Collaborator, Invite, InviteAcceptResult, InvitePreview } from "@/api/types";

export const getOrCreateInvite = (tripId: number) =>
  apiRequest<Invite>(`/trips/${tripId}/invite`, { method: "POST" });

export const revokeInvite = (tripId: number) =>
  apiRequest<void>(`/trips/${tripId}/invite`, { method: "DELETE" });

export const listCollaborators = (tripId: number) =>
  apiRequest<Collaborator[]>(`/trips/${tripId}/collaborators`);

export const removeCollaborator = (tripId: number, userId: number) =>
  apiRequest<void>(`/trips/${tripId}/collaborators/${userId}`, { method: "DELETE" });

export const getInvitePreview = (token: string) => apiRequest<InvitePreview>(`/invites/${token}`);

export const acceptInvite = (token: string) =>
  apiRequest<InviteAcceptResult>(`/invites/${token}/accept`, { method: "POST" });
