export interface BackpackingDetail {
  trip_type: "backpacking";
  trip_id: number;
  base_pack_weight_oz: number | null;
  permit_required: boolean | null;
  permit_notes: string | null;
  resupply_plan: string | null;
  bear_canister_required: boolean | null;
  water_capacity_liters: number | null;
  longest_dry_stretch_mi: number | null;
  total_distance_mi: number | null;
  elevation_gain_ft: number | null;
  gear_weight_oz: number;
  est_pack_weight_oz: number | null;
  water_needed_dry_stretch_l: number | null;
  water_carry_sufficient: boolean | null;
  avg_miles_per_day: number | null;
}

export interface BackpackingDetailUpdate {
  base_pack_weight_oz?: number | null;
  permit_required?: boolean | null;
  permit_notes?: string | null;
  resupply_plan?: string | null;
  bear_canister_required?: boolean | null;
  water_capacity_liters?: number | null;
  longest_dry_stretch_mi?: number | null;
  total_distance_mi?: number | null;
  elevation_gain_ft?: number | null;
}
