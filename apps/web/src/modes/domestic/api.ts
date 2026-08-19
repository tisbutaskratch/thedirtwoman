import { apiRequest } from "@/api/client";
import type { DomesticDetail, DomesticDetailUpdate } from "@/modes/domestic/types";

export const getDomesticDetail = (tripId: number) =>
  apiRequest<DomesticDetail>(`/trips/${tripId}/detail`);

export const updateDomesticDetail = (tripId: number, payload: DomesticDetailUpdate) =>
  apiRequest<DomesticDetail>(`/trips/${tripId}/detail`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
