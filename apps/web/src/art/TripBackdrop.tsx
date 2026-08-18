import type { TripType } from "@/api/types";
import Mascot from "@/art/mascots";
import { TRIP_TYPE_META } from "@/lib/tripTypes";

/*
 * Neobrutalist backdrop for a trip header.
 *
 * Flat bands of the trip's own hue, hard edges, no gradients or photography.
 * It has to sit behind text and stay quiet, so it's built from three or four
 * shapes at low opacity rather than a busy illustration. The type's mascot
 * stands at the right-hand end.
 */

const TONE_FILL: Record<string, string> = {
  rose: "text-rose-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  violet: "text-violet-500",
  sky: "text-sky-500",
  fuchsia: "text-fuchsia-500",
  cyan: "text-cyan-500",
  orange: "text-orange-500",
};

/** Per-type scenery: the horizon line each discipline actually looks at. */
function Scenery({ type }: { type: TripType }) {
  switch (type) {
    case "motocamping":
      // Berms and a rooster tail of dirt.
      return (
        <>
          <path d="M0 78 Q120 46 240 70 T480 58 L480 100 L0 100 Z" fill="currentColor" fillOpacity="0.07" />
          <path d="M0 88 Q140 66 280 84 T480 78 L480 100 L0 100 Z" fill="currentColor" fillOpacity="0.1" />
          <circle cx="392" cy="30" r="16" fill="currentColor" fillOpacity="0.08" />
        </>
      );
    case "camping":
      // Conifers on a flat pitch.
      return (
        <>
          <path d="M0 82 L480 82 L480 100 L0 100 Z" fill="currentColor" fillOpacity="0.1" />
          {[40, 92, 150, 205].map((x, i) => (
            <path
              key={x}
              d={`M${x} 82 L${x + 16} 82 L${x + 8} ${48 - i * 4} Z`}
              fill="currentColor"
              fillOpacity="0.08"
            />
          ))}
          <circle cx="404" cy="26" r="14" fill="currentColor" fillOpacity="0.07" />
        </>
      );
    case "overlanding":
      // Mesa silhouettes.
      return (
        <>
          <path d="M0 100 L0 66 L70 66 L96 44 L170 44 L192 66 L300 66 L300 100 Z" fill="currentColor" fillOpacity="0.08" />
          <path d="M0 100 L0 84 L480 84 L480 100 Z" fill="currentColor" fillOpacity="0.12" />
          <circle cx="398" cy="28" r="15" fill="currentColor" fillOpacity="0.08" />
        </>
      );
    case "backpacking":
      // Hard-edged peaks.
      return (
        <>
          <path d="M0 100 L86 26 L150 76 L214 34 L300 100 Z" fill="currentColor" fillOpacity="0.08" />
          <path d="M0 100 L60 58 L130 100 Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M0 90 L480 90 L480 100 L0 100 Z" fill="currentColor" fillOpacity="0.12" />
        </>
      );
    case "international":
      // Skyline plus a long horizon.
      return (
        <>
          <path d="M0 90 L480 90 L480 100 L0 100 Z" fill="currentColor" fillOpacity="0.12" />
          {[24, 56, 84, 118, 150, 188].map((x, i) => (
            <rect
              key={x}
              x={x}
              y={90 - (28 + ((i * 13) % 34))}
              width={i % 2 ? 20 : 26}
              height={28 + ((i * 13) % 34)}
              fill="currentColor"
              fillOpacity="0.08"
            />
          ))}
          <circle cx="402" cy="28" r="15" fill="currentColor" fillOpacity="0.07" />
        </>
      );
    case "domestic":
      // Road stripes running to a vanishing point.
      return (
        <>
          <path d="M0 100 L200 46 L268 46 L480 100 Z" fill="currentColor" fillOpacity="0.07" />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={228 - i * 6}
              y={52 + i * 12}
              width={12 + i * 10}
              height={5 + i * 2}
              fill="currentColor"
              fillOpacity="0.08"
            />
          ))}
          <path d="M0 94 L480 94 L480 100 L0 100 Z" fill="currentColor" fillOpacity="0.1" />
        </>
      );
  }
}

export default function TripBackdrop({ type }: { type: TripType }) {
  const tone = TRIP_TYPE_META[type].tone;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden opacity-70 ${TONE_FILL[tone]}`}
    >
      <svg
        viewBox="0 0 480 100"
        preserveAspectRatio="xMaxYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <Scenery type={type} />
      </svg>
      {/* The host, standing at the end of the scene. Hidden on narrow screens
          where the header needs every pixel for the title. */}
      <Mascot
        type={type}
        size={92}
        className="absolute bottom-0 right-4 hidden text-content opacity-[0.18] lg:block"
      />
    </div>
  );
}
