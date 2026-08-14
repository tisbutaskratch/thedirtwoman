export interface InternationalDetail {
  trip_type: "international";
  trip_id: number;
  home_currency: string | null;
  destination_currencies: string[] | null;
  primary_timezone: string | null;
}

export interface InternationalDetailUpdate {
  home_currency?: string | null;
  destination_currencies?: string[] | null;
  primary_timezone?: string | null;
}
