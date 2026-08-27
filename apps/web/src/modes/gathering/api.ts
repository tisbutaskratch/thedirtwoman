import { apiRequest } from "@/api/client";
import type { GatheringDetail, GatheringDetailUpdate } from "@/modes/gathering/types";

export const getGatheringDetail = (tripId: number) =>
  apiRequest<GatheringDetail>(`/trips/${tripId}/detail`);

export const updateGatheringDetail = (tripId: number, payload: GatheringDetailUpdate) =>
  apiRequest<GatheringDetail>(`/trips/${tripId}/detail`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
