import type { TripType } from "@/api/types";

export const TRIP_TYPE_META: Record<
  TripType,
  { label: string; icon: string; accent: string; accentBg: string }
> = {
  motocamping: {
    label: "Motocamping",
    icon: "🏍️",
    accent: "border-l-orange-500",
    accentBg: "bg-orange-500",
  },
  camping: {
    label: "Camping",
    icon: "🏕️",
    accent: "border-l-emerald-500",
    accentBg: "bg-emerald-500",
  },
  overlanding: {
    label: "Overlanding",
    icon: "🚙",
    accent: "border-l-amber-500",
    accentBg: "bg-amber-500",
  },
  backpacking: {
    label: "Backpacking",
    icon: "🥾",
    accent: "border-l-violet-500",
    accentBg: "bg-violet-500",
  },
  international: {
    label: "International",
    icon: "✈️",
    accent: "border-l-fuchsia-500",
    accentBg: "bg-fuchsia-500",
  },
};
