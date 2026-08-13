import type { TripType } from "@/api/types";

export const TRIP_TYPE_META: Record<TripType, { label: string; icon: string }> = {
  motocamping: { label: "Motocamping", icon: "🏍️" },
  camping: { label: "Camping", icon: "🏕️" },
  overlanding: { label: "Overlanding", icon: "🚙" },
  backpacking: { label: "Backpacking", icon: "🥾" },
  international: { label: "International", icon: "✈️" },
};
