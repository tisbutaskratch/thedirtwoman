import { apiRequest } from "@/api/client";
import type { InternationalDetail, InternationalDetailUpdate } from "@/modes/international/types";

export const getInternationalDetail = (tripId: number) =>
  apiRequest<InternationalDetail>(`/trips/${tripId}/detail`);

export const updateInternationalDetail = (tripId: number, payload: InternationalDetailUpdate) =>
  apiRequest<InternationalDetail>(`/trips/${tripId}/detail`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
