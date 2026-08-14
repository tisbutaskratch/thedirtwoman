import { apiRequest } from "@/api/client";
import type { BackpackingDetail, BackpackingDetailUpdate } from "@/modes/backpacking/types";

export const getBackpackingDetail = (tripId: number) =>
  apiRequest<BackpackingDetail>(`/trips/${tripId}/detail`);

export const updateBackpackingDetail = (tripId: number, payload: BackpackingDetailUpdate) =>
  apiRequest<BackpackingDetail>(`/trips/${tripId}/detail`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
