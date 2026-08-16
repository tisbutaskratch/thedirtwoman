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
  tire_pressure_offroad_psi: number | null;
  tire_pressure_highway_psi: number | null;
  water_capacity_gal: number | null;
  aux_fuel_gal: number | null;
  est_range_miles: number | null;
  est_total_range_miles: number | null;
  water_days_supported: number | null;
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
  tire_pressure_offroad_psi?: number | null;
  tire_pressure_highway_psi?: number | null;
  water_capacity_gal?: number | null;
  aux_fuel_gal?: number | null;
}
