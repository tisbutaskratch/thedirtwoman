export interface BackpackingDetail {
  trip_type: "backpacking";
  trip_id: number;
  base_pack_weight_oz: number | null;
  permit_required: boolean | null;
  permit_notes: string | null;
  resupply_plan: string | null;
  gear_weight_oz: number;
  est_pack_weight_oz: number | null;
}

export interface BackpackingDetailUpdate {
  base_pack_weight_oz?: number | null;
  permit_required?: boolean | null;
  permit_notes?: string | null;
  resupply_plan?: string | null;
}
