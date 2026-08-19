export type DomesticTravelMode = "car" | "train" | "flight";

export interface DomesticDetail {
  trip_type: "domestic";
  trip_id: number;
  travel_mode: DomesticTravelMode | null;
  booking_ref: string | null;
  origin: string | null;
  destination: string | null;

  is_rental: boolean | null;
  rental_company: string | null;
  total_distance_mi: number | null;
  vehicle_mpg: number | null;
  fuel_price_per_gallon: number | null;

  rail_operator: string | null;
  rail_pass_type: string | null;
  seat_reservation_required: boolean | null;
  seat_reservations_booked: boolean | null;

  airline: string | null;
  checked_bags: number | null;
  carry_on_only: boolean | null;
  separate_tickets: boolean | null;
  layover_notes: string | null;

  lodging_type: string | null;
  lodging_ref: string | null;

  est_fuel_gallons: number | null;
  est_fuel_cost: number | null;
  recommended_airport_lead_hours: number | null;
  reservations_outstanding: boolean | null;
  connection_risk: string | null;
}

export interface DomesticDetailUpdate {
  travel_mode?: DomesticTravelMode | null;
  booking_ref?: string | null;
  origin?: string | null;
  destination?: string | null;
  is_rental?: boolean | null;
  rental_company?: string | null;
  total_distance_mi?: number | null;
  vehicle_mpg?: number | null;
  fuel_price_per_gallon?: number | null;
  rail_operator?: string | null;
  rail_pass_type?: string | null;
  seat_reservation_required?: boolean | null;
  seat_reservations_booked?: boolean | null;
  airline?: string | null;
  checked_bags?: number | null;
  carry_on_only?: boolean | null;
  separate_tickets?: boolean | null;
  layover_notes?: string | null;
  lodging_type?: string | null;
  lodging_ref?: string | null;
}
