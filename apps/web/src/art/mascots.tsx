import type { TripType } from "@/api/types";

/*
 * The trip-type hosts.
 *
 * One original character per discipline, drawn in the same neobrutalist hand
 * as the critters, each caught in a pose rather than standing to attention.
 * They live in the mode panel's corner so opening a trip has a face on it.
 *
 *  Motocamping — Dusty, a goggled rider slumped against the section edge
 *  Camping     — Bramble, a bear who has clearly been through the cooler
 *  Overlanding — Ridge, arms folded on the roof rack, surveying
 *  Backpacking — Fern, mid-stride under a pack twice her size
 *  International — Wanda, sunglasses on, entirely unbothered
 *  Domestic    — Milo, asleep upright with a ticket in hand
 */

interface MascotProps {
  size?: number;
  className?: string;
}

const S = 1.7;

function Stage({ size = 72, className = "", children }: MascotProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
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

/** Head + two dots, shared so the cast reads as one hand. */
function Head({ cx, cy, r = 8 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.18"
      />
      <circle cx={cx - 3} cy={cy} r="1.4" fill="currentColor" />
      <circle cx={cx + 3} cy={cy} r="1.4" fill="currentColor" />
    </>
  );
}

/** Dusty: leaning on the edge of the section, goggles up, arms crossed. */
export function Dusty(p: MascotProps) {
  return (
    <Stage {...p}>
      <Head cx={30} cy={20} />
      {/* goggles pushed up on the forehead */}
      <path d="M22 15 L38 15" stroke="currentColor" strokeWidth={S} />
      <circle cx="26" cy="13" r="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="34" cy="13" r="3" stroke="currentColor" strokeWidth="1.3" />
      {/* torso, leaning */}
      <path
        d="M24 28 L38 28 L40 46 L26 46 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* crossed arms */}
      <path d="M24 33 Q32 38 40 33" stroke="currentColor" strokeWidth={S} />
      {/* one boot up on the edge */}
      <path d="M28 46 L26 58 M38 46 L42 54 L48 54" stroke="currentColor" strokeWidth={S} />
      <path d="M20 58 L30 58" stroke="currentColor" strokeWidth={S} />
    </Stage>
  );
}

/** Bramble: a bear, sitting, holding something it should not have. */
export function Bramble(p: MascotProps) {
  return (
    <Stage {...p}>
      {/* ears */}
      <circle cx="23" cy="14" r="4" stroke="currentColor" strokeWidth={S} />
      <circle cx="39" cy="14" r="4" stroke="currentColor" strokeWidth={S} />
      <Head cx={31} cy={20} r={9} />
      {/* snout */}
      <ellipse cx="31" cy="24" rx="3.5" ry="2.5" stroke="currentColor" strokeWidth="1.3" />
      {/* sitting body */}
      <path
        d="M20 30 Q31 27 42 30 L44 50 Q31 54 18 50 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.14"
      />
      {/* the stolen sandwich */}
      <path d="M40 38 L50 34 L52 39 L42 43 Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M41 40 L51 36" stroke="currentColor" strokeWidth="1.1" />
      {/* feet */}
      <ellipse cx="24" cy="53" rx="4" ry="3" stroke="currentColor" strokeWidth={S} />
      <ellipse cx="38" cy="53" rx="4" ry="3" stroke="currentColor" strokeWidth={S} />
    </Stage>
  );
}

/** Ridge: sitting on the roof rack, legs dangling, surveying the horizon. */
export function Ridge(p: MascotProps) {
  return (
    <Stage {...p}>
      <Head cx={30} cy={16} />
      {/* brimmed hat */}
      <path d="M20 12 L40 12" stroke="currentColor" strokeWidth={S} />
      <path d="M24 12 Q24 6 30 6 Q36 6 36 12" stroke="currentColor" strokeWidth={S} />
      {/* torso */}
      <path
        d="M24 24 L36 24 L38 38 L22 38 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* hand shading the eyes */}
      <path d="M36 27 L44 22" stroke="currentColor" strokeWidth={S} />
      {/* the rack it's sitting on */}
      <path d="M10 38 L54 38" stroke="currentColor" strokeWidth={S} />
      <path d="M14 38 L14 44 M50 38 L50 44" stroke="currentColor" strokeWidth="1.3" />
      {/* dangling legs */}
      <path d="M27 38 L26 50 M33 38 L35 50" stroke="currentColor" strokeWidth={S} />
    </Stage>
  );
}

/** Fern: mid-stride, leaning into a pack that is frankly too big. */
export function Fern(p: MascotProps) {
  return (
    <Stage {...p}>
      {/* the enormous pack */}
      <rect
        x="34"
        y="14"
        width="18"
        height="24"
        rx="5"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M34 24 L52 24" stroke="currentColor" strokeWidth="1.3" />
      <Head cx={24} cy={17} r={7} />
      {/* body leaning forward under the load */}
      <path d="M22 24 L30 38" stroke="currentColor" strokeWidth={S} />
      <path d="M30 26 L36 22" stroke="currentColor" strokeWidth={S} />
      {/* stride */}
      <path d="M30 38 L20 50 M30 38 L36 50" stroke="currentColor" strokeWidth={S} />
      <path d="M17 50 L22 50 M33 50 L39 50" stroke="currentColor" strokeWidth={S} />
      {/* trekking pole */}
      <path d="M14 24 L12 52" stroke="currentColor" strokeWidth="1.4" />
    </Stage>
  );
}

/** Wanda: sunglasses, drink, reclined, entirely unbothered. */
export function Wanda(p: MascotProps) {
  return (
    <Stage {...p}>
      <Head cx={22} cy={22} />
      {/* sunglasses over the eyes */}
      <rect x="15" y="19" width="6" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.4" />
      <rect x="23" y="19" width="6" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.4" />
      <path d="M21 21 L23 21" stroke="currentColor" strokeWidth="1.2" />
      {/* reclined body */}
      <path
        d="M28 30 L48 34 L46 42 L26 38 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* legs up */}
      <path d="M46 38 L56 34" stroke="currentColor" strokeWidth={S} />
      {/* the drink, held aloft */}
      <path d="M18 34 L14 34 L16 42 L20 42 Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M17 30 L17 34" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="17" cy="29" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      {/* lounger */}
      <path d="M10 46 L56 46" stroke="currentColor" strokeWidth={S} />
    </Stage>
  );
}

/** Milo: upright, fast asleep, ticket still in hand. */
export function Milo(p: MascotProps) {
  return (
    <Stage {...p}>
      {/* head tipped back */}
      <circle
        cx="30"
        cy="19"
        r="8"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M26 18 Q28 20 30 18" stroke="currentColor" strokeWidth={S} />
      <path d="M32 18 Q34 20 36 18" stroke="currentColor" strokeWidth={S} />
      {/* the Z */}
      <path d="M40 8 L47 8 L40 15 L47 15" stroke="currentColor" strokeWidth="1.4" />
      {/* seated body */}
      <path
        d="M23 28 L37 28 L39 46 L21 46 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* ticket slipping from the hand */}
      <path d="M37 36 L48 40 L46 45 L35 41 Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M40 39 L44 41" stroke="currentColor" strokeWidth="1.1" />
      {/* seat + legs */}
      <path d="M16 46 L44 46" stroke="currentColor" strokeWidth={S} />
      <path d="M25 46 L25 56 M35 46 L35 56" stroke="currentColor" strokeWidth={S} />
    </Stage>
  );
}

export const MASCOTS: Record<
  TripType,
  { name: string; Art: (p: MascotProps) => JSX.Element }
> = {
  motocamping: { name: "Dusty", Art: Dusty },
  camping: { name: "Bramble", Art: Bramble },
  overlanding: { name: "Ridge", Art: Ridge },
  backpacking: { name: "Fern", Art: Fern },
  international: { name: "Wanda", Art: Wanda },
  domestic: { name: "Milo", Art: Milo },
};

/** The host for a trip type, posed in the corner of its mode panel. */
export default function Mascot({
  type,
  size = 72,
  className = "",
}: {
  type: TripType;
  size?: number;
  className?: string;
}) {
  const { name, Art } = MASCOTS[type];
  return (
    <span title={name} className={`pointer-events-none select-none ${className}`}>
      <Art size={size} />
    </span>
  );
}
