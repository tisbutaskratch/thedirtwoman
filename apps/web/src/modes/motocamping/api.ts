import { apiRequest } from "@/api/client";
import type { MotocampingDetail, MotocampingDetailUpdate } from "@/modes/motocamping/types";

export const getMotocampingDetail = (tripId: number) =>
  apiRequest<MotocampingDetail>(`/trips/${tripId}/detail`);

export const updateMotocampingDetail = (tripId: number, payload: MotocampingDetailUpdate) =>
  apiRequest<MotocampingDetail>(`/trips/${tripId}/detail`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
