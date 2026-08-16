export interface InternationalDetail {
  trip_type: "international";
  trip_id: number;
  home_currency: string | null;
  destination_currencies: string[] | null;
  primary_timezone: string | null;
  passport_expiry: string | null;
  visa_required: boolean | null;
  visa_notes: string | null;
  vaccinations_notes: string | null;
  travel_insurance_ref: string | null;
  embassy_contact: string | null;
  step_enrolled: boolean | null;
  passport_valid_for_trip: boolean | null;
  passport_days_of_margin: number | null;
  docs_ready_count: number;
  docs_total_count: number;
}

export interface InternationalDetailUpdate {
  home_currency?: string | null;
  destination_currencies?: string[] | null;
  primary_timezone?: string | null;
  passport_expiry?: string | null;
  visa_required?: boolean | null;
  visa_notes?: string | null;
  vaccinations_notes?: string | null;
  travel_insurance_ref?: string | null;
  embassy_contact?: string | null;
  step_enrolled?: boolean | null;
}
