import { apiRequest } from "@/api/client";
import type { OverlandingDetail, OverlandingDetailUpdate } from "@/modes/overlanding/types";

export const getOverlandingDetail = (tripId: number) =>
  apiRequest<OverlandingDetail>(`/trips/${tripId}/detail`);

export const updateOverlandingDetail = (tripId: number, payload: OverlandingDetailUpdate) =>
  apiRequest<OverlandingDetail>(`/trips/${tripId}/detail`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
