import type { TripType } from "@/api/types";

/*
 * Trip-type marks.
 *
 * These are hand-drawn rather than emoji for two reasons: Unicode has no
 * dirt-bike glyph (🏍️ is unmistakably a sport bike, which is the wrong
 * discipline entirely), and drawing all six in one neobrutalist style —
 * flat fills, heavy outlines, one offset shadow — keeps them a set rather
 * than six borrowed pictures. Section glyphs stay emoji; only trip types
 * get bespoke art.
 */

interface MarkProps {
  size?: number;
  className?: string;
}

const STROKE = 1.6;

function Frame({
  size = 24,
  className = "",
  children,
}: MarkProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/**
 * Dirt motorcycle (enduro/motocross).
 *
 * Outlined like the rest of the set, but the bodywork is still drawn as one
 * closed shape — fender, seat, tank and engine as a single continuous
 * profile — rather than an open triangle of tubes. That silhouette is what
 * separates a motorcycle from a bicycle; the fill was never doing the work,
 * so it can drop to the same light wash the other marks use. Fat tyres with
 * knobby tread and a high front fender carry the "dirt" half.
 */
export function DirtBikeMark(props: MarkProps) {
  return (
    <Frame {...props}>
      {/* Bodywork: one continuous profile, lightly washed. */}
      <path
        d="M1.5 10.5 L5 9.5 L11 10.5 L15.5 11 L18 7.5 L21.5 8.5 L21 14
           L19.5 20.5 L17.5 21.5 L12 21.5 L9 17.5 L3.5 15.5 Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Engine block and tank seam, so the mass reads as machinery. */}
      <path d="M10.5 16.5 L19 16.5" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
      <path d="M13.5 17 L13.5 21" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
      <path d="M16.5 17 L16.5 21" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />

      {/* Forks raked forward to the front axle, and narrow bars. */}
      <path d="M20.5 10 L26.5 5.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M26 6.5 L24.5 22.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M24.5 3.5 L30 3.5" stroke="currentColor" strokeWidth="1.7" />
      {/* High front fender, clear of both the tyre and the bars. */}
      <path d="M20 12.5 Q25.5 9 31 12" stroke="currentColor" strokeWidth="1.7" />

      {/* Fat knobby tyres — kept heavier than the bodywork on purpose. */}
      <circle cx="7.5" cy="22.5" r="5.8" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="24.5" cy="22.5" r="5.8" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M7.5 15.5 L7.5 14.1 M14.5 22.5 L15.9 22.5 M7.5 29.5 L7.5 30.9 M0.5 22.5 L-0.9 22.5
           M24.5 15.5 L24.5 14.1 M31.5 22.5 L32.9 22.5 M24.5 29.5 L24.5 30.9"
        stroke="currentColor"
        strokeWidth="1.3"
        opacity="0.55"
      />
      <circle cx="7.5" cy="22.5" r="1.4" fill="currentColor" />
      <circle cx="24.5" cy="22.5" r="1.4" fill="currentColor" />
    </Frame>
  );
}

/** A-frame tent with a guy line. */
export function TentMark(props: MarkProps) {
  return (
    <Frame {...props}>
      <path
        d="M16 6 L28 25 L4 25 Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M16 6 L16 25" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M16 12 L11 25" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M16 12 L21 25" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M28 25 L31 28" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M4 25 L1 28" stroke="currentColor" strokeWidth={STROKE} />
    </Frame>
  );
}

/** 4x4 pickup carrying a roof-top tent. */
export function RigMark(props: MarkProps) {
  return (
    <Frame {...props}>
      {/* roof tent */}
      <path
        d="M8 10 L15 6 L22 10 Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        fill="currentColor"
        fillOpacity="0.25"
      />
      {/* cab + bed */}
      <path
        d="M5 20 L5 14 L14 14 L17 10 L22 10 L22 14 L28 14 L28 20 Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        fill="currentColor"
        fillOpacity="0.12"
      />
      <circle cx="10" cy="22" r="3.6" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="24" cy="22" r="3.6" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="10" cy="22" r="1" fill="currentColor" />
      <circle cx="24" cy="22" r="1" fill="currentColor" />
    </Frame>
  );
}

/** Loaded pack with a rolled mat on top. */
export function PackMark(props: MarkProps) {
  return (
    <Frame {...props}>
      <rect
        x="9"
        y="10"
        width="14"
        height="18"
        rx="4"
        stroke="currentColor"
        strokeWidth={STROKE}
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* lid strap */}
      <path d="M9 18 L23 18" stroke="currentColor" strokeWidth={STROKE} />
      {/* shoulder straps */}
      <path d="M12 10 Q12 5 16 5 Q20 5 20 10" stroke="currentColor" strokeWidth={STROKE} />
      {/* rolled mat */}
      <rect x="7" y="6" width="18" height="4" rx="2" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M13 22 L19 22" stroke="currentColor" strokeWidth={STROKE} />
    </Frame>
  );
}

/** Airliner from above: crossing a border. */
export function PlaneMark(props: MarkProps) {
  return (
    <Frame {...props}>
      {/*
       * Outlined with a light wash rather than a solid fill, so it sits in
       * the same weight class as the tent, pack and rig. The dirt bike is
       * the deliberate exception — solid is the only way it stops reading
       * as a bicycle — but a plane has no such twin to be confused with.
       */}
      <path
        d="M16 1.5 Q18.8 1.5 19.3 7.5 L19.3 12.5 L30 20 L30 23 L19.3 20.2 L19.3 25
           L22.6 28.4 L22.6 30.2 L16 28.2 L9.4 30.2 L9.4 28.4 L12.7 25 L12.7 20.2
           L2 23 L2 20 L12.7 12.5 L12.7 7.5 Q13.2 1.5 16 1.5 Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Cabin windows down the spine, so it isn't a featureless dart. */}
      <path
        d="M16 8 L16 10 M16 12 L16 14 M16 16 L16 18"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.5"
      />
    </Frame>
  );
}

/** Signposted road: in-country travel, whichever way you take it. */
export function RoadMark(props: MarkProps) {
  return (
    <Frame {...props}>
      {/* road narrowing to the horizon */}
      <path
        d="M11 29 L14 8 L18 8 L21 29 Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* centre line dashes */}
      <path d="M16 11 L16 14" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M16 17 L16 20" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M16 23 L16 26" stroke="currentColor" strokeWidth={STROKE} />
      {/* signpost */}
      <path d="M25 28 L25 9" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M25 10 L31 12 L25 14 Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path d="M25 16 L20 18 L25 20 Z" stroke="currentColor" strokeWidth={STROKE} />
    </Frame>
  );
}

export const TRIP_MARKS: Record<TripType, (props: MarkProps) => JSX.Element> = {
  motocamping: DirtBikeMark,
  camping: TentMark,
  overlanding: RigMark,
  backpacking: PackMark,
  international: PlaneMark,
  domestic: RoadMark,
};

/** The mark for a trip type, at whatever size the surrounding chip wants. */
export default function TripMark({
  type,
  size = 24,
  className = "",
}: {
  type: TripType;
  size?: number;
  className?: string;
}) {
  const Mark = TRIP_MARKS[type];
  return <Mark size={size} className={className} />;
}
