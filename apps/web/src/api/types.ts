export type TripType =
  | "motocamping"
  | "camping"
  | "overlanding"
  | "backpacking"
  | "international"
  | "domestic"
  | "gathering";

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

/** What somebody is bringing to a get-together. */
export type ContributionKind = "food" | "drink" | "dessert" | "game" | "supplies" | "other";

export interface Contribution {
  id: number;
  trip_id: number;
  name: string;
  kind: ContributionKind;
  /** Day 1 is the first day. Null means nobody has picked a day yet. */
  day_index: number | null;
  assigned_to_user_id: number | null;
  assigned_to_all: boolean;
  serves: number | null;
  confirmed: boolean;
  notes: string | null;
}

export interface ContributionCreate {
  name: string;
  kind?: ContributionKind;
  day_index?: number | null;
  assigned_to_user_id?: number | null;
  assigned_to_all?: boolean;
  serves?: number | null;
  confirmed?: boolean;
  notes?: string | null;
}

export interface ContributionUpdate {
  name?: string;
  kind?: ContributionKind;
  day_index?: number | null;
  assigned_to_user_id?: number | null;
  assigned_to_all?: boolean;
  serves?: number | null;
  confirmed?: boolean;
  notes?: string | null;
}

/** What sort of vehicle a rig is, which mostly decides its icon. */
export type RigKind = "motorcycle" | "truck" | "suv" | "van" | "car" | "other";

/**
 * A vehicle you own. Yours alone, and not attached to any trip: bringing a
 * rig on a trip copies its name and range onto the trip rather than linking
 * to it, so selling the truck never rewrites last autumn.
 */
export interface Rig {
  id: number;
  user_id: number;
  name: string;
  kind: RigKind;
  make: string | null;
  model: string | null;
  year: number | null;
  fuel_capacity_gal: number | null;
  fuel_economy_mpg: number | null;
  ground_clearance_in: number | null;
  tire_size: string | null;
  drivetrain: string | null;
  notes: string | null;
  /** "2019 Toyota Tacoma", or null when none of those were filled in. */
  description: string | null;
  /** Full tank to empty, derated for real-world mileage. */
  est_range_miles: number | null;
}

export interface RigCreate {
  name: string;
  kind?: RigKind;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  fuel_capacity_gal?: number | null;
  fuel_economy_mpg?: number | null;
  ground_clearance_in?: number | null;
  tire_size?: string | null;
  drivetrain?: string | null;
  notes?: string | null;
}

export type RigUpdate = Partial<RigCreate>;

/** One thing in a kit. Reached through its kit, never on its own. */
export interface KitItem {
  id: number;
  kit_id: number;
  name: string;
  quantity: number;
  notes: string | null;
}

export interface KitItemCreate {
  name: string;
  quantity?: number;
  notes?: string | null;
}

export type KitItemUpdate = Partial<KitItemCreate>;

/**
 * A named set of things you keep packed, yours alone. Deliberately not
 * about tools: a camp kitchen, a carry-on and a first aid kit are the same
 * shape as a trailside repair kit.
 */
export interface Kit {
  id: number;
  user_id: number;
  name: string;
  notes: string | null;
  items: KitItem[];
}

export interface KitCreate {
  name: string;
  notes?: string | null;
}

export type KitUpdate = Partial<KitCreate>;

/** What happened when a bag was emptied onto a packing list. */
export interface PackedKit {
  added: number;
  skipped: number;
  gear: Gear[];
}

/** Parts of a trip page that can be pinned to the top. Mirrors the API enum. */
export type SectionKey =
  | "members"
  | "timeline"
  | "files"
  | "contributions"
  | "packing"
  | "tasks"
  | "expenses"
  | "locations"
  | "notes"
  | "journal"
  | "photos"
  | "assignments";

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
