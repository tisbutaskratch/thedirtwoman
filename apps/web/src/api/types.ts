export type TripType =
  | "motocamping"
  | "camping"
  | "overlanding"
  | "backpacking"
  | "international"
  | "domestic";

/** Access level someone has on a trip. */
export type TripRole = "editor" | "viewer";

export interface Trip {
  id: number;
  /** Null once the creator has deleted their account and left the trip. */
  user_id: number | null;
  title: string;
  trip_type: TripType;
  start_date: string | null;
  end_date: string | null;
  archived_at: string | null;
  owner_vehicle: string | null;
  owner_fuel_range_miles: number | null;
  created_at: string;
  percent_planned: number;
  my_role: TripRole;
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
  archived?: boolean;
  owner_vehicle?: string | null;
  owner_fuel_range_miles?: number | null;
}

export type LocationKind =
  | "waypoint"
  | "campsite"
  | "lodging"
  | "transit"
  | "poi"
  | "fuel_stop";

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

/** Shared by the packing list and the prep checklist. */
export type RequiredLevel = "required" | "optional";

/** @deprecated kept as an alias while call sites migrate to RequiredLevel. */
export type GearRequiredLevel = RequiredLevel;

export interface Gear {
  id: number;
  trip_id: number;
  name: string;
  category: string | null;
  weight_oz: number | null;
  packed: boolean;
  required_level: GearRequiredLevel;
  assigned_to_user_id: number | null;
  assigned_to_all: boolean;
  notes: string | null;
}

export interface GearCreate {
  name: string;
  category?: string | null;
  weight_oz?: number | null;
  packed?: boolean;
  required_level?: GearRequiredLevel;
  assigned_to_user_id?: number | null;
  assigned_to_all?: boolean;
  notes?: string | null;
}

export interface GearUpdate {
  name?: string;
  category?: string | null;
  weight_oz?: number | null;
  packed?: boolean;
  required_level?: GearRequiredLevel;
  assigned_to_user_id?: number | null;
  assigned_to_all?: boolean;
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
  required_level: RequiredLevel;
  assigned_to_user_id: number | null;
  assigned_to_all: boolean;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface TaskCreate {
  title: string;
  done?: boolean;
  required_level?: RequiredLevel;
  assigned_to_user_id?: number | null;
  assigned_to_all?: boolean;
  due_date?: string | null;
  notes?: string | null;
}

export interface TaskUpdate {
  title?: string;
  done?: boolean;
  required_level?: RequiredLevel;
  assigned_to_user_id?: number | null;
  assigned_to_all?: boolean;
  due_date?: string | null;
  notes?: string | null;
}

export interface Collaborator {
  role: TripRole;
  is_creator: boolean;
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
  role?: TripRole;
}

export interface PendingMember {
  /**
   * Whether the invitation email actually reached the provider. Null when
   * listing existing invites, which says nothing about the original send.
   */
  email_sent?: boolean | null;
  role: TripRole;
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
  download_url: string;
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
  role: TripRole;
  trip_id: number;
  trip_title: string;
  trip_type: TripType;
  invited_by_name: string;
  already_member: boolean;
}

export interface InviteAcceptResult {
  trip_id: number;
}

/**
 * A private diary entry. Only ever your own: the API never returns another
 * member's entries, which is why there is no author field to display.
 */
export interface JournalEntry {
  id: number;
  trip_id: number;
  entry_date: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryCreate {
  entry_date: string;
  body: string;
}

export interface JournalEntryUpdate {
  entry_date?: string;
  body?: string;
}
