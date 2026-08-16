import type { TripType } from "@/api/types";
import type { Tone } from "@/components/ui";

export const TRIP_TYPE_META: Record<
  TripType,
  { label: string; icon: string; tone: Tone; blurb: string }
> = {
  motocamping: {
    label: "Motocamping",
    icon: "🏍️",
    tone: "orange",
    blurb: "Two wheels, tank range, and a tent",
  },
  camping: {
    label: "Camping",
    icon: "🏕️",
    tone: "emerald",
    blurb: "Reserve the site, plan the meals",
  },
  overlanding: {
    label: "Overlanding",
    icon: "🚙",
    tone: "amber",
    blurb: "Rig, recovery, and remote range",
  },
  backpacking: {
    label: "Backpacking",
    icon: "🥾",
    tone: "violet",
    blurb: "Every ounce and every water source",
  },
  international: {
    label: "International",
    icon: "✈️",
    tone: "fuchsia",
    blurb: "Documents, currency, and time zones",
  },
};

/** Consistent glyph + hue per trip section, reused across the whole app. */
export const SECTION_META = {
  members: { icon: "👥", tone: "cyan" as Tone },
  timeline: { icon: "🗓️", tone: "emerald" as Tone },
  files: { icon: "📎", tone: "sky" as Tone },
  packing: { icon: "🎒", tone: "violet" as Tone },
  tasks: { icon: "✅", tone: "amber" as Tone },
  photos: { icon: "📸", tone: "fuchsia" as Tone },
  notes: { icon: "📝", tone: "orange" as Tone },
  locations: { icon: "📍", tone: "rose" as Tone },
  expenses: { icon: "💰", tone: "emerald" as Tone },
  essentials: { icon: "🧭", tone: "cyan" as Tone },
};
