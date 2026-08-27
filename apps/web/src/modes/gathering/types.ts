export interface GatheringDetail {
  trip_type: "gathering";
  trip_id: number;
  occasion: string | null;
  host_name: string | null;
  headcount: number | null;
  dietary_notes: string | null;
  kitchen_notes: string | null;
  /** Contributions somebody has put their name against. */
  claimed_count: number;
  unclaimed_count: number;
  /** False when the table is all desserts and drinks. */
  has_a_main: boolean;
  /** Null when nobody has filled in serving sizes, rather than a false zero. */
  est_servings: number | null;
  servings_shortfall: number | null;
}

export interface GatheringDetailUpdate {
  occasion?: string | null;
  host_name?: string | null;
  headcount?: number | null;
  dietary_notes?: string | null;
  kitchen_notes?: string | null;
}
