export interface MotocampingDetail {
  trip_type: "motocamping";
  trip_id: number;
  motorcycle_name: string | null;
  fuel_capacity_gal: number | null;
  fuel_economy_mpg: number | null;
  daily_ride_target_miles: number | null;
  est_range_miles: number | null;
}

export interface MotocampingDetailUpdate {
  motorcycle_name?: string | null;
  fuel_capacity_gal?: number | null;
  fuel_economy_mpg?: number | null;
  daily_ride_target_miles?: number | null;
}
