// Cotopaxi-inspired neon accents, cycled across cards/categories/tags so
// the personal site reads as color-blocked rather than single-tone.
export const NEON_PALETTE = [
  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-l-emerald-500", dot: "bg-emerald-400" },
  { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-l-rose-500", dot: "bg-rose-400" },
  { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-l-sky-500", dot: "bg-sky-400" },
  { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-l-amber-500", dot: "bg-amber-400" },
  { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-l-violet-500", dot: "bg-violet-400" },
  { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-l-cyan-500", dot: "bg-cyan-400" },
  { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-l-orange-500", dot: "bg-orange-400" },
  { text: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-l-fuchsia-500", dot: "bg-fuchsia-400" },
];

export function neonAt(index: number) {
  return NEON_PALETTE[((index % NEON_PALETTE.length) + NEON_PALETTE.length) % NEON_PALETTE.length];
}
