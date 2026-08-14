export interface OverlandingDetail {
  trip_type: "overlanding";
  trip_id: number;
  vehicle_name: string | null;
  fuel_capacity_gal: number | null;
  fuel_economy_mpg: number | null;
  ground_clearance_in: number | null;
  drivetrain: string | null;
  has_recovery_gear: boolean | null;
  comms_plan: string | null;
  emergency_contact: string | null;
  est_range_miles: number | null;
}

export interface OverlandingDetailUpdate {
  vehicle_name?: string | null;
  fuel_capacity_gal?: number | null;
  fuel_economy_mpg?: number | null;
  ground_clearance_in?: number | null;
  drivetrain?: string | null;
  has_recovery_gear?: boolean | null;
  comms_plan?: string | null;
  emergency_contact?: string | null;
}
