import type { TripType } from "@/api/types";
import { TRIP_TYPE_META } from "@/lib/tripTypes";

/*
 * The one-second opener.
 *
 * Each trip type gets its own thing crossing the screen while the trip
 * loads: a parade of cats, a bear ambling through, a rig with a roof tent,
 * a hiker plodding under a pack. It runs once and gets out of the way —
 * anything longer stops being a delight and becomes a wait.
 *
 * Everything is CSS keyframes on transforms, so it costs nothing and it
 * honours prefers-reduced-motion (see index.css) by simply not moving.
 */

interface TravellerProps {
  className?: string;
}

const S = 2;

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 60"
      className="h-32 w-64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/**
 * A parade of cats, trotting.
 *
 * Not a motorcycle — the joke is better. Three of them at slightly different
 * sizes with staggered bobs, so they read as a little procession rather than
 * one shape copied three times.
 */
function Cat({ scale = 1, delay = 0 }: { scale?: number; delay?: number }) {
  return (
    <g transform={`scale(${scale})`} className="trip-cat" style={{ animationDelay: `${delay}ms` }}>
      {/* tail, up and hooked — the cue that reads first */}
      <path
        d="M4 36 Q-3 32 0 24 Q1.5 20 5 21"
        stroke="currentColor"
        strokeWidth="2.4"
        fill="none"
      />
      {/* body */}
      <path
        d="M5 38 Q4 26 16 26 Q28 26 27 38 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* head */}
      <circle
        cx="26"
        cy="20"
        r="7.5"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* ears */}
      <path d="M20 15 L20 8 L26 13 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.35" />
      <path d="M32 15 L33 8 L27 12.5 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.35" />
      {/* face: two dots, a nose, and whiskers */}
      <circle cx="23.5" cy="19" r="1.3" fill="currentColor" />
      <circle cx="29" cy="19" r="1.3" fill="currentColor" />
      <path d="M26.2 22.5 L26.2 23.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M31 21 L35 20 M31 23 L35 23.5" stroke="currentColor" strokeWidth="1" opacity="0.65" />
      {/* legs */}
      <path
        d="M9 38 L9 43 M15 38 L15 43 M20 38 L20 43 M25 38 L25 43"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* paws */}
      <path d="M7.5 43 L10.5 43 M13.5 43 L16.5 43 M18.5 43 L21.5 43 M23.5 43 L26.5 43"
        stroke="currentColor" strokeWidth="2.2" />
    </g>
  );
}

function CatsTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <g transform="translate(0 8)">
        <Cat scale={0.72} delay={0} />
      </g>
      <g transform="translate(30 4)">
        <Cat scale={0.9} delay={160} />
      </g>
      <g transform="translate(72 10)">
        <Cat scale={0.62} delay={320} />
      </g>
    </g>
  );
}

/** Bear, ambling. */
function BearTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <circle cx="22" cy="20" r="4" stroke="currentColor" strokeWidth={S} />
      <circle cx="36" cy="20" r="4" stroke="currentColor" strokeWidth={S} />
      <circle cx="29" cy="26" r="9" stroke="currentColor" strokeWidth={S} fill="currentColor" fillOpacity="0.15" />
      <circle cx="26" cy="26" r="1.4" fill="currentColor" />
      <circle cx="32" cy="26" r="1.4" fill="currentColor" />
      <ellipse cx="29" cy="31" rx="3" ry="2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M36 30 Q56 26 66 34 Q70 44 60 48 L40 48 Q34 42 36 30 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M44 48 L44 54 M58 48 L58 54" stroke="currentColor" strokeWidth={S} />
    </g>
  );
}

/** Rig with a roof-top tent. */
function RigTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <path d="M24 20 L40 12 L56 20 Z" stroke="currentColor" strokeWidth={S} fill="currentColor" fillOpacity="0.2" />
      <path
        d="M12 40 L12 26 L36 26 L44 20 L58 20 L58 26 L72 26 L72 40 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.12"
      />
      <circle cx="26" cy="44" r="7" stroke="currentColor" strokeWidth={S} />
      <circle cx="62" cy="44" r="7" stroke="currentColor" strokeWidth={S} />
      <path d="M6 34 L0 34 M8 40 L1 40" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    </g>
  );
}

/** Hiker under a pack, plodding. */
function HikerTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <rect x="40" y="14" width="16" height="22" rx="4" stroke="currentColor" strokeWidth={S} fill="currentColor" fillOpacity="0.18" />
      <circle cx="30" cy="16" r="6" stroke="currentColor" strokeWidth={S} />
      <path d="M28 22 L36 38" stroke="currentColor" strokeWidth={S} />
      <path d="M34 26 L42 22" stroke="currentColor" strokeWidth={S} />
      <path d="M36 38 L26 52 M36 38 L44 52" stroke="currentColor" strokeWidth={S} />
      <path d="M22 52 L28 52 M41 52 L48 52" stroke="currentColor" strokeWidth={S} />
      <path d="M18 22 L16 54" stroke="currentColor" strokeWidth="1.5" />
    </g>
  );
}

/** Wheeled suitcase, trundling. */
function SuitcaseTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <rect x="20" y="22" width="34" height="26" rx="4" stroke="currentColor" strokeWidth={S} fill="currentColor" fillOpacity="0.15" />
      <path d="M20 32 L54 32" stroke="currentColor" strokeWidth="1.4" />
      <path d="M54 26 L64 26 L64 12 L58 12" stroke="currentColor" strokeWidth={S} />
      <circle cx="27" cy="52" r="4" stroke="currentColor" strokeWidth={S} />
      <circle cx="47" cy="52" r="4" stroke="currentColor" strokeWidth={S} />
      <path d="M30 16 L36 16 M33 12 L33 20" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
    </g>
  );
}

/** Little train, chuffing. */
function TrainTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <path
        d="M14 44 L14 24 L34 24 L34 16 L54 16 L54 44 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.14"
      />
      <rect x="38" y="21" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="18" y="30" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="22" cy="48" r="4" stroke="currentColor" strokeWidth={S} />
      <circle cx="46" cy="48" r="4" stroke="currentColor" strokeWidth={S} />
      <path d="M44 16 L44 10" stroke="currentColor" strokeWidth={S} />
      <circle cx="44" cy="7" r="3" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
      <circle cx="50" cy="3" r="2" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
    </g>
  );
}

const TRAVELLERS: Record<TripType, (p: TravellerProps) => JSX.Element> = {
  motocamping: CatsTraveller,
  camping: BearTraveller,
  overlanding: RigTraveller,
  backpacking: HikerTraveller,
  international: SuitcaseTraveller,
  domestic: TrainTraveller,
};

const TONE_TEXT: Record<string, string> = {
  rose: "text-rose-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  violet: "text-violet-400",
  sky: "text-sky-400",
  fuchsia: "text-fuchsia-400",
};

export default function TripLoader({ type }: { type: TripType }) {
  const meta = TRIP_TYPE_META[type];
  const Traveller = TRAVELLERS[type];

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <div className={`relative overflow-hidden ${TONE_TEXT[meta.tone] ?? "text-accent"}`}>
        <Scene>
          {/* the ground it travels along */}
          <path d="M0 56 L120 56" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
          <Traveller className="trip-loader-traveller" />
        </Scene>
      </div>
      <p className="text-sm text-content-subtle">Loading your {meta.label.toLowerCase()} trip…</p>
    </div>
  );
}
