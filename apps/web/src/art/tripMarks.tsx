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
 * Drawn as a solid silhouette rather than line art. That is the whole
 * difference: a bicycle is see-through — an open triangle of thin tubes
 * between two big hoops — whereas a motorcycle is one continuous lump of
 * bodywork with an engine filling the gap. At 22px in a chip only the
 * silhouette survives, so the mass has to carry the read, with the dirt
 * cues (high front fender, upswept rear fender, knobby tyres) on top.
 */
export function DirtBikeMark(props: MarkProps) {
  return (
    <Frame {...props}>
      {/* One continuous body: upswept rear fender → seat → tank → shrouds,
          with the engine block filling the space between the wheels. */}
      <path
        d="M1.5 10.5 L5 9.5 L11 10.5 L15.5 11 L18 7.5 L21.5 8.5 L21 14
           L19.5 20.5 L17.5 21.5 L12 21.5 L9 17.5 L3.5 15.5 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Forks raked forward to the front axle, and narrow bars. */}
      <path d="M20.5 10 L26.5 5.5" stroke="currentColor" strokeWidth="2.4" />
      <path d="M26 6.5 L24.5 22.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24.5 3.5 L30 3.5" stroke="currentColor" strokeWidth="1.9" />
      {/* High front fender, floating well clear of the tyre — and clear of
          the bars, or the two read as one flat plate. */}
      <path d="M20 12.5 Q25.5 9 31 12" stroke="currentColor" strokeWidth="2" />

      {/* Fat knobby tyres last, so they sit over the bodywork. */}
      <circle cx="7.5" cy="22.5" r="5.8" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="24.5" cy="22.5" r="5.8" stroke="currentColor" strokeWidth="2.6" />
      <path
        d="M7.5 15.4 L7.5 13.9 M14.6 22.5 L16.1 22.5 M7.5 29.6 L7.5 31.1 M0.4 22.5 L-1.1 22.5
           M24.5 15.4 L24.5 13.9 M31.6 22.5 L33.1 22.5 M24.5 29.6 L24.5 31.1"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.6"
      />
      {/* Hubs, punched out of the tyre so it reads as a wheel not a disc. */}
      <circle cx="7.5" cy="22.5" r="1.5" fill="currentColor" />
      <circle cx="24.5" cy="22.5" r="1.5" fill="currentColor" />
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
       * One filled top-down silhouette. Drawn as a single shape rather than
       * outlined parts so the swept wings still read at chip size, where
       * separate strokes would collapse into a smudge.
       */}
      <path
        d="M16 1.5 Q18.8 1.5 19.3 7.5 L19.3 12.5 L30 20 L30 23 L19.3 20.2 L19.3 25
           L22.6 28.4 L22.6 30.2 L16 28.2 L9.4 30.2 L9.4 28.4 L12.7 25 L12.7 20.2
           L2 23 L2 20 L12.7 12.5 L12.7 7.5 Q13.2 1.5 16 1.5 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Cabin windows down the spine, so it isn't a featureless dart. */}
      <path
        d="M16 8 L16 10 M16 12 L16 14 M16 16 L16 18"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.35"
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
