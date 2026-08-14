export interface CampingDetail {
  trip_type: "camping";
  trip_id: number;
  campground_reservation_ref: string | null;
  fire_restrictions_checked: boolean | null;
}

export interface CampingDetailUpdate {
  campground_reservation_ref?: string | null;
  fire_restrictions_checked?: boolean | null;
}
