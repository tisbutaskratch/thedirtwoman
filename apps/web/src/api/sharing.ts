import { apiRequest } from "@/api/client";
import type {
  Collaborator,
  EmailInviteCreate,
  Invite,
  InviteAcceptResult,
  InvitePreview,
  PendingMember,
  VehicleUpdate,
} from "@/api/types";

export const getOrCreateInvite = (tripId: number) =>
  apiRequest<Invite>(`/trips/${tripId}/invite`, { method: "POST" });

export const revokeInvite = (tripId: number) =>
  apiRequest<void>(`/trips/${tripId}/invite`, { method: "DELETE" });

export const listCollaborators = (tripId: number) =>
  apiRequest<Collaborator[]>(`/trips/${tripId}/collaborators`);

export const removeCollaborator = (tripId: number, userId: number) =>
  apiRequest<void>(`/trips/${tripId}/collaborators/${userId}`, { method: "DELETE" });

export const updateMyVehicle = (tripId: number, payload: VehicleUpdate) =>
  apiRequest<Collaborator>(`/trips/${tripId}/collaborators/me`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const inviteByEmail = (tripId: number, payload: EmailInviteCreate) =>
  apiRequest<PendingMember>(`/trips/${tripId}/invites/email`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listPendingInvites = (tripId: number) =>
  apiRequest<PendingMember[]>(`/trips/${tripId}/pending-invites`);

export const cancelPendingInvite = (tripId: number, inviteId: number) =>
  apiRequest<void>(`/trips/${tripId}/invites/email/${inviteId}`, { method: "DELETE" });

export const getInvitePreview = (token: string) => apiRequest<InvitePreview>(`/invites/${token}`);

export const acceptInvite = (token: string) =>
  apiRequest<InviteAcceptResult>(`/invites/${token}/accept`, { method: "POST" });
