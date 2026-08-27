import { apiRequest } from "@/api/client";
import type {
  PackedKit,
  KitItem,
  Kit,
  KitCreate,
  KitUpdate,
  KitItemCreate,
  KitItemUpdate,
} from "@/api/types";

export const listKits = () => apiRequest<Kit[]>("/kits");

export const createKit = (payload: KitCreate) =>
  apiRequest<Kit>("/kits", { method: "POST", body: JSON.stringify(payload) });

export const updateKit = (id: number, payload: KitUpdate) =>
  apiRequest<Kit>(`/kits/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteKit = (id: number) =>
  apiRequest<void>(`/kits/${id}`, { method: "DELETE" });

// Items are addressed through their kit, matching the API: an item has no
// meaning outside the kit it is in.
export const addItem = (kitId: number, payload: KitItemCreate) =>
  apiRequest<KitItem>(`/kits/${kitId}/items`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateItem = (kitId: number, itemId: number, payload: KitItemUpdate) =>
  apiRequest<KitItem>(`/kits/${kitId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteItem = (kitId: number, itemId: number) =>
  apiRequest<void>(`/kits/${kitId}/items/${itemId}`, { method: "DELETE" });

/** Empty a bag onto a trip's packing list. */
export const packKitOntoTrip = (tripId: number, kitId: number) =>
  apiRequest<PackedKit>(`/trips/${tripId}/gear/from-kit/${kitId}`, { method: "POST" });
