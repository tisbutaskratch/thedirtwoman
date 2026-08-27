import { apiRequest } from "@/api/client";
import type { Rig, RigCreate, RigUpdate } from "@/api/types";

/** Your rigs. Never scoped to a trip: a rig is yours either way. */
export const listRigs = () => apiRequest<Rig[]>("/rigs");

export const createRig = (payload: RigCreate) =>
  apiRequest<Rig>("/rigs", { method: "POST", body: JSON.stringify(payload) });

export const updateRig = (id: number, payload: RigUpdate) =>
  apiRequest<Rig>(`/rigs/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteRig = (id: number) => apiRequest<void>(`/rigs/${id}`, { method: "DELETE" });
