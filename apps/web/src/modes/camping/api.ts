import { apiRequest } from "@/api/client";
import type { CampingDetail, CampingDetailUpdate } from "@/modes/camping/types";

export const getCampingDetail = (tripId: number) =>
  apiRequest<CampingDetail>(`/trips/${tripId}/detail`);

export const updateCampingDetail = (tripId: number, payload: CampingDetailUpdate) =>
  apiRequest<CampingDetail>(`/trips/${tripId}/detail`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
