import { apiRequest, apiRequestBlob } from "@/api/client";
import type {
  Activity,
  ActivityCreate,
  ActivityUpdate,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  Gear,
  GearCreate,
  GearUpdate,
  Location,
  LocationCreate,
  LocationUpdate,
  Note,
  NoteCreate,
  SettleUpdate,
  Trip,
  TripCreate,
  TripUpdate,
} from "@/api/types";

export const listTrips = () => apiRequest<Trip[]>("/trips");

export const createTrip = (payload: TripCreate) =>
  apiRequest<Trip>("/trips", { method: "POST", body: JSON.stringify(payload) });

export const getTrip = (id: number) => apiRequest<Trip>(`/trips/${id}`);

export const updateTrip = (id: number, payload: TripUpdate) =>
  apiRequest<Trip>(`/trips/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteTrip = (id: number) => apiRequest<void>(`/trips/${id}`, { method: "DELETE" });

export const listLocations = (tripId: number) =>
  apiRequest<Location[]>(`/trips/${tripId}/locations`);

export const createLocation = (tripId: number, payload: LocationCreate) =>
  apiRequest<Location>(`/trips/${tripId}/locations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateLocation = (id: number, payload: LocationUpdate) =>
  apiRequest<Location>(`/locations/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteLocation = (id: number) =>
  apiRequest<void>(`/locations/${id}`, { method: "DELETE" });

export const listActivities = (tripId: number) =>
  apiRequest<Activity[]>(`/trips/${tripId}/activities`);

export const createActivity = (tripId: number, payload: ActivityCreate) =>
  apiRequest<Activity>(`/trips/${tripId}/activities`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateActivity = (id: number, payload: ActivityUpdate) =>
  apiRequest<Activity>(`/activities/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteActivity = (id: number) =>
  apiRequest<void>(`/activities/${id}`, { method: "DELETE" });

export const listExpenses = (tripId: number) => apiRequest<Expense[]>(`/trips/${tripId}/expenses`);

export const createExpense = (tripId: number, payload: ExpenseCreate) =>
  apiRequest<Expense>(`/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateExpense = (id: number, payload: ExpenseUpdate) =>
  apiRequest<Expense>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteExpense = (id: number) =>
  apiRequest<void>(`/expenses/${id}`, { method: "DELETE" });

export const settleMyExpenseShare = (id: number, payload: SettleUpdate) =>
  apiRequest<Expense>(`/expenses/${id}/participants/me`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const listGear = (tripId: number) => apiRequest<Gear[]>(`/trips/${tripId}/gear`);

export const createGear = (tripId: number, payload: GearCreate) =>
  apiRequest<Gear>(`/trips/${tripId}/gear`, { method: "POST", body: JSON.stringify(payload) });

export const updateGear = (id: number, payload: GearUpdate) =>
  apiRequest<Gear>(`/gear/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteGear = (id: number) => apiRequest<void>(`/gear/${id}`, { method: "DELETE" });

export const listNotes = (tripId: number) => apiRequest<Note[]>(`/trips/${tripId}/notes`);

export const createNote = (tripId: number, payload: NoteCreate) =>
  apiRequest<Note>(`/trips/${tripId}/notes`, { method: "POST", body: JSON.stringify(payload) });

export const updateNote = (id: number, payload: NoteCreate) =>
  apiRequest<Note>(`/notes/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteNote = (id: number) => apiRequest<void>(`/notes/${id}`, { method: "DELETE" });

/**
 * Download the trip as a calendar file.
 *
 * Goes through fetch rather than a plain link because the endpoint needs the
 * access token, and a navigation cannot carry an Authorization header. The
 * filename comes from the server's Content-Disposition so it matches the trip
 * title, with a fallback for the case where the header is unreadable.
 */
export async function downloadTripCalendar(tripId: number, title: string): Promise<void> {
  const blob = await apiRequestBlob(`/trips/${tripId}/calendar.ics`);
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${title.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/ +/g, "-").toLowerCase() || "trip"}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
