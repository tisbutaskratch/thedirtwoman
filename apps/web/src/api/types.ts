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
  owner_vehicle: string | null;
  owner_fuel_range_miles: number | null;
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
  owner_vehicle?: string | null;
  owner_fuel_range_miles?: number | null;
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
  contact_phone: string | null;
  confirmation_ref: string | null;
  address: string | null;
}

export interface LocationCreate {
  name: string;
  kind: LocationKind;
  lat?: number | null;
  lng?: number | null;
  arrival_time?: string | null;
  notes?: string | null;
  order_index?: number;
  contact_phone?: string | null;
  confirmation_ref?: string | null;
  address?: string | null;
}

export interface LocationUpdate {
  name?: string;
  kind?: LocationKind;
  lat?: number | null;
  lng?: number | null;
  arrival_time?: string | null;
  notes?: string | null;
  order_index?: number;
  contact_phone?: string | null;
  confirmation_ref?: string | null;
  address?: string | null;
}

export interface Activity {
  id: number;
  trip_id: number;
  title: string;
  day_index: number;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  todos: string | null;
  location_id: number | null;
}

export interface ActivityCreate {
  title: string;
  day_index?: number;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
  todos?: string | null;
  location_id?: number | null;
}

export interface ActivityUpdate {
  title?: string;
  day_index?: number;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
  todos?: string | null;
  location_id?: number | null;
}

export interface ExpenseParticipant {
  user_id: number;
  settled: boolean;
  share: number;
}

export interface Expense {
  id: number;
  trip_id: number;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  date: string;
  paid_by_user_id: number | null;
  participants: ExpenseParticipant[];
}

export interface ExpenseCreate {
  category: string;
  description?: string | null;
  amount: number;
  currency?: string;
  date: string;
  paid_by_user_id?: number | null;
  participant_user_ids?: number[];
}

export interface ExpenseUpdate {
  category?: string;
  description?: string | null;
  amount?: number;
  currency?: string;
  date?: string;
  paid_by_user_id?: number | null;
  participant_user_ids?: number[];
}

export interface SettleUpdate {
  settled: boolean;
}

export type GearRequiredLevel = "required" | "optional";

export interface Gear {
  id: number;
  trip_id: number;
  name: string;
  category: string | null;
  weight_oz: number | null;
  packed: boolean;
  required_level: GearRequiredLevel;
  assigned_to_user_id: number | null;
  notes: string | null;
}

export interface GearCreate {
  name: string;
  category?: string | null;
  weight_oz?: number | null;
  packed?: boolean;
  required_level?: GearRequiredLevel;
  assigned_to_user_id?: number | null;
  notes?: string | null;
}

export interface GearUpdate {
  name?: string;
  category?: string | null;
  weight_oz?: number | null;
  packed?: boolean;
  required_level?: GearRequiredLevel;
  assigned_to_user_id?: number | null;
  notes?: string | null;
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

export interface Task {
  id: number;
  trip_id: number;
  title: string;
  done: boolean;
  assigned_to_user_id: number | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface TaskCreate {
  title: string;
  done?: boolean;
  assigned_to_user_id?: number | null;
  due_date?: string | null;
  notes?: string | null;
}

export interface TaskUpdate {
  title?: string;
  done?: boolean;
  assigned_to_user_id?: number | null;
  due_date?: string | null;
  notes?: string | null;
}

export interface Collaborator {
  user_id: number;
  name: string;
  email: string;
  vehicle: string | null;
  fuel_range_miles: number | null;
  joined_at: string;
}

export interface VehicleUpdate {
  vehicle: string | null;
  fuel_range_miles: number | null;
}

export interface EmailInviteCreate {
  email: string;
}

export interface PendingMember {
  id: number;
  email: string;
  invited_at: string;
}

export type AttachmentKind = "photo" | "file";

export interface Attachment {
  id: number;
  trip_id: number;
  kind: AttachmentKind;
  title: string;
  description: string | null;
  url: string;
  original_filename: string;
  content_type: string;
  created_at: string;
}

export interface Invite {
  token: string;
  trip_id: number;
  expires_at: string;
}

export interface InvitePreview {
  trip_id: number;
  trip_title: string;
  trip_type: TripType;
  owner_name: string;
  already_member: boolean;
}

export interface InviteAcceptResult {
  trip_id: number;
}
