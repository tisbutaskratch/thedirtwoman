export interface CampingDetail {
  trip_type: "camping";
  trip_id: number;
  campground_reservation_ref: string | null;
  fire_restrictions_checked: boolean | null;
  potable_water_available: boolean | null;
  firewood_policy: string | null;
  check_in_time: string | null;
  quiet_hours: string | null;
  meal_plan: string | null;
  party_size: number;
  nights: number | null;
  est_water_needed_gal: number | null;
}

export interface CampingDetailUpdate {
  campground_reservation_ref?: string | null;
  fire_restrictions_checked?: boolean | null;
  potable_water_available?: boolean | null;
  firewood_policy?: string | null;
  check_in_time?: string | null;
  quiet_hours?: string | null;
  meal_plan?: string | null;
}
