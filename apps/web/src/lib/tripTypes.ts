import type { TripType } from "@/api/types";
import type { Tone } from "@/components/ui";

/*
 * Trip-type identity, in one place.
 *
 * Hues are chosen so no two types read as the same colour at a glance —
 * that was the problem with orange motocamping next to amber overlanding,
 * and violet backpacking next to fuchsia international. Each type now sits
 * in a clearly separate part of the wheel: red, green, yellow, purple,
 * blue, pink.
 *
 * The mark for each type lives in art/tripMarks.tsx — hand-drawn, because
 * Unicode has no dirt bike and a borrowed sportbike glyph is simply the
 * wrong vehicle.
 */
export const TRIP_TYPE_META: Record<
  TripType,
  { label: string; tone: Tone; blurb: string }
> = {
  motocamping: {
    label: "Motocamping",
    tone: "rose",
    blurb: "Two wheels, tank range, and a tent",
  },
  camping: {
    label: "Camping",
    tone: "emerald",
    blurb: "Reserve the site, plan the meals",
  },
  overlanding: {
    label: "Overlanding",
    tone: "amber",
    blurb: "Rig, recovery, and remote range",
  },
  backpacking: {
    label: "Backpacking",
    tone: "violet",
    blurb: "Every ounce and every water source",
  },
  international: {
    label: "International",
    tone: "sky",
    blurb: "Documents, currency, and time zones",
  },
  domestic: {
    label: "Domestic",
    tone: "fuchsia",
    blurb: "Car, rail, or a short flight",
  },
};

export const TRIP_TYPES: TripType[] = [
  "motocamping",
  "camping",
  "overlanding",
  "backpacking",
  "domestic",
  "international",
];

/** Consistent glyph + hue per trip section, reused across the whole app. */
export const SECTION_META = {
  members: { glyph: "👥", tone: "cyan" as Tone },
  timeline: { glyph: "🗓️", tone: "emerald" as Tone },
  files: { glyph: "📎", tone: "sky" as Tone },
  packing: { glyph: "🎒", tone: "violet" as Tone },
  tasks: { glyph: "✅", tone: "amber" as Tone },
  screenshots: { glyph: "📷", tone: "fuchsia" as Tone },
  notes: { glyph: "📝", tone: "orange" as Tone },
  locations: { glyph: "📍", tone: "rose" as Tone },
  expenses: { glyph: "💰", tone: "emerald" as Tone },
  essentials: { glyph: "🧭", tone: "cyan" as Tone },
  assignments: { glyph: "🧾", tone: "sky" as Tone },
  journal: { glyph: "📔", tone: "violet" as Tone },
};
