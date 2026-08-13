export type TripType = "motocamping" | "camping" | "overlanding" | "backpacking" | "international";
export type TripStatus = "planning" | "active" | "completed";

export interface Trip {
  id: number;
  user_id: number;
  title: string;
  trip_type: TripType;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  created_at: string;
  percent_planned: number;
}

export interface TripCreate {
  title: string;
  trip_type: TripType;
  start_date?: string | null;
  end_date?: string | null;
}

export interface TripUpdate {
  title?: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: TripStatus;
}

export type LocationKind = "waypoint" | "campsite" | "hotel" | "poi" | "fuel_stop";

export interface Location {
  id: number;
  trip_id: number;
  name: string;
  lat: number | null;
  lng: number | null;
  kind: LocationKind;
  arrival_time: string | null;
  notes: string | null;
  order_index: number;
}

export interface LocationCreate {
  name: string;
  kind: LocationKind;
  lat?: number | null;
  lng?: number | null;
  arrival_time?: string | null;
  notes?: string | null;
  order_index?: number;
}

export interface Activity {
  id: number;
  trip_id: number;
  title: string;
  day_index: number;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  location_id: number | null;
}

export interface ActivityCreate {
  title: string;
  day_index?: number;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
  location_id?: number | null;
}

export interface Expense {
  id: number;
  trip_id: number;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  date: string;
}

export interface ExpenseCreate {
  category: string;
  description?: string | null;
  amount: number;
  currency?: string;
  date: string;
}

export interface Gear {
  id: number;
  trip_id: number;
  name: string;
  category: string | null;
  weight_oz: number | null;
  packed: boolean;
}

export interface GearCreate {
  name: string;
  category?: string | null;
  weight_oz?: number | null;
  packed?: boolean;
}

export interface GearUpdate {
  packed?: boolean;
}

export interface Note {
  id: number;
  trip_id: number;
  body: string;
  created_at: string;
}

export interface NoteCreate {
  body: string;
}
