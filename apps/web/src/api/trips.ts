import { apiRequest } from "@/api/client";
import type {
  Activity,
  ActivityCreate,
  Expense,
  ExpenseCreate,
  Gear,
  GearCreate,
  GearUpdate,
  Location,
  LocationCreate,
  Note,
  NoteCreate,
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

export const deleteLocation = (id: number) =>
  apiRequest<void>(`/locations/${id}`, { method: "DELETE" });

export const listActivities = (tripId: number) =>
  apiRequest<Activity[]>(`/trips/${tripId}/activities`);

export const createActivity = (tripId: number, payload: ActivityCreate) =>
  apiRequest<Activity>(`/trips/${tripId}/activities`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listExpenses = (tripId: number) => apiRequest<Expense[]>(`/trips/${tripId}/expenses`);

export const createExpense = (tripId: number, payload: ExpenseCreate) =>
  apiRequest<Expense>(`/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listGear = (tripId: number) => apiRequest<Gear[]>(`/trips/${tripId}/gear`);

export const createGear = (tripId: number, payload: GearCreate) =>
  apiRequest<Gear>(`/trips/${tripId}/gear`, { method: "POST", body: JSON.stringify(payload) });

export const updateGear = (id: number, payload: GearUpdate) =>
  apiRequest<Gear>(`/gear/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const listNotes = (tripId: number) => apiRequest<Note[]>(`/trips/${tripId}/notes`);

export const createNote = (tripId: number, payload: NoteCreate) =>
  apiRequest<Note>(`/trips/${tripId}/notes`, { method: "POST", body: JSON.stringify(payload) });

export const deleteNote = (id: number) => apiRequest<void>(`/notes/${id}`, { method: "DELETE" });
