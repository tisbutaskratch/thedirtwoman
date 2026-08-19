import type { TripType } from "@/api/types";
import { TRIP_TYPE_META } from "@/lib/tripTypes";

/*
 * The one-second opener.
 *
 * Each trip type gets its own thing crossing the screen while the trip
 * loads: a cat chasing a dirt bike, a bear ambling through, a rig with a
 * roof tent, a hiker plodding under a pack. It runs once and gets out of
 * the way, anything longer stops being a delight and becomes a wait.
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
 * One cat, in hot pursuit of a dirt bike.
 *
 * The bike leads, the cat gives chase a little way behind with its tail
 * streaming out and its legs at full stretch. Both ride the same crossing
 * transform so the gap between them stays constant. The cat is never
 * catching up, which is the joke.
 */
function ChasedBike() {
  return (
    <g transform="translate(44 14.2) scale(0.72)">
      {/* Same silhouette as the trip mark, at the loader's scale: engine slung
          low, tail kicked up, pipe swept over it, knobs outside the rim. */}

      {/* Engine block. */}
      <path
        d="M24 32 L38 32 L40 43 L27 44 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.3"
      />
      {/* Tank and seat, kicking up over the back wheel. */}
      <path
        d="M8 21 L20 27 L30 24 L38 17 L44 21 L42 27 L28 30 L21 32 L13 27 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.16"
      />
      {/* Swingarm to the rear axle. */}
      <path d="M27 42 L18 46" stroke="currentColor" strokeWidth="2.6" />
      <path d="M25 32 L18 45" stroke="currentColor" strokeWidth="2" />
      {/* Upswept pipe. */}
      <path
        d="M26 38 Q16 40 12 30 Q10 24 4 23"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
      {/* Fork through to the front axle, bars with a crossbrace. */}
      <path d="M47 13 L58 46" stroke="currentColor" strokeWidth="2.6" />
      <path d="M46 13 L62 13" stroke="currentColor" strokeWidth="2.2" />
      <path d="M49 16 L55 16" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
      <path d="M47 29 Q57 21 68 29" stroke="currentColor" strokeWidth="2.2" fill="none" />

      {/* Rider, tucked in over the tank. */}
      <circle cx="30" cy="9" r="6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M30 15 L27 24 L44 19" stroke="currentColor" strokeWidth="2.4" fill="none" />

      {/* Knobby tyres. */}
      <circle cx="18" cy="46" r="11.5" stroke="currentColor" strokeWidth="3.4" />
      <circle cx="58" cy="46" r="11.5" stroke="currentColor" strokeWidth="3.4" />
      <path
        d="M18 32.5 L18 35 M27.5 36.5 L25.8 38.2 M31.5 46 L29 46 M27.5 55.5 L25.8 53.8
           M18 59.5 L18 57 M8.5 55.5 L10.2 53.8 M4.5 46 L7 46 M8.5 36.5 L10.2 38.2
           M58 32.5 L58 35 M67.5 36.5 L65.8 38.2 M71.5 46 L69 46 M67.5 55.5 L65.8 53.8
           M58 59.5 L58 57 M48.5 55.5 L50.2 53.8 M44.5 46 L47 46 M48.5 36.5 L50.2 38.2"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <circle cx="18" cy="46" r="2.4" fill="currentColor" />
      <circle cx="58" cy="46" r="2.4" fill="currentColor" />
      {/* Roost off the back tyre. */}
      <path
        d="M4 48 L-4 44 M5 54 L-5 54 M6 59 L-3 63"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.55"
      />
    </g>
  );
}

/** The cat, at full stretch, gaining on nothing. */
function ChasingCat() {
  return (
    <g transform="translate(8 37.6) scale(0.45)" className="trip-cat">
      {/* tail streaming out behind */}
      <path d="M2 26 Q-8 22 -10 12" stroke="currentColor" strokeWidth="2.6" fill="none" />
      {/* stretched body */}
      <path
        d="M2 30 Q1 18 16 18 Q30 18 29 30 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="currentColor"
        fillOpacity="0.18"
      />
      {/* head, eyes forward on the chase */}
      <circle cx="29" cy="14" r="8" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.18" />
      <path d="M22 9 L21 1 L28 6 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.32" />
      <path d="M36 9 L38 1 L30 5.5 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.32" />
      <circle cx="26.5" cy="13" r="1.4" fill="currentColor" />
      <circle cx="32" cy="13" r="1.4" fill="currentColor" />
      <path d="M29.3 16.5 L29.3 17.8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M37 15 L43 13.5 M37 17.5 L43 18.5" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
      {/* legs at full stretch, front and back */}
      <path d="M6 30 L-2 40 M12 31 L7 41" stroke="currentColor" strokeWidth="2.2" />
      <path d="M22 31 L27 41 M27 30 L35 39" stroke="currentColor" strokeWidth="2.2" />
      <path d="M-4 40 L1 40 M5 41 L10 41 M25 41 L30 41 M33 39 L38 39" stroke="currentColor" strokeWidth="2.2" />
      {/* motion lines behind the cat */}
      <path d="M-6 24 L-14 24 M-6 30 L-16 30" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
    </g>
  );
}

function CatChaseTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <ChasingCat />
      <ChasedBike />
    </g>
  );
}

/** Bear, ambling. Drawn facing left, so mirrored to match the direction of travel. */
function BearTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <g transform="translate(88 0) scale(-1 1)">
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

/** Hiker under a pack, plodding. Mirrored so the pack rides on their back. */
function HikerTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <g transform="translate(72 0) scale(-1 1)">
      <rect x="40" y="14" width="16" height="22" rx="4" stroke="currentColor" strokeWidth={S} fill="currentColor" fillOpacity="0.18" />
      <circle cx="30" cy="16" r="6" stroke="currentColor" strokeWidth={S} />
      <path d="M28 22 L36 38" stroke="currentColor" strokeWidth={S} />
      <path d="M34 26 L42 22" stroke="currentColor" strokeWidth={S} />
      <path d="M36 38 L26 52 M36 38 L44 52" stroke="currentColor" strokeWidth={S} />
      <path d="M22 52 L28 52 M41 52 L48 52" stroke="currentColor" strokeWidth={S} />
      <path d="M18 22 L16 54" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </g>
  );
}

/** Wheeled suitcase, trundling. Mirrored so it's pulled, not pushed. */
function SuitcaseTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      <g transform="translate(84 0) scale(-1 1)">
      <rect x="20" y="22" width="34" height="26" rx="4" stroke="currentColor" strokeWidth={S} fill="currentColor" fillOpacity="0.15" />
      <path d="M20 32 L54 32" stroke="currentColor" strokeWidth="1.4" />
      <path d="M54 26 L64 26 L64 12 L58 12" stroke="currentColor" strokeWidth={S} />
      <circle cx="27" cy="52" r="4" stroke="currentColor" strokeWidth={S} />
      <circle cx="47" cy="52" r="4" stroke="currentColor" strokeWidth={S} />
      <path d="M30 16 L36 16 M33 12 L33 20" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      </g>
    </g>
  );
}

/**
 * Little steam loco, chuffing.
 *
 * Redrawn rather than mirrored: the old one put the chimney on the tall
 * block, which reads as a cab, so it was ambiguous whichever way you turned
 * it. Now it's unmistakable. Cab at the back, boiler running forward, and
 * the chimney at the front with its smoke trailing off behind.
 */
function TrainTraveller({ className }: TravellerProps) {
  return (
    <g className={className}>
      {/* cab, at the back */}
      <path
        d="M10 46 L10 16 L32 16 L32 46 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.14"
      />
      <rect x="15" y="21" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      {/* boiler, running forward from the cab */}
      <path
        d="M32 46 L32 27 L60 27 L60 46 Z"
        stroke="currentColor"
        strokeWidth={S}
        fill="currentColor"
        fillOpacity="0.14"
      />
      {/* boiler bands */}
      <path d="M41 27 L41 42 M50 27 L50 42" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      {/* chimney at the front, with the smoke trailing back over the cab */}
      <path d="M52 27 L52 17 L58 17 L58 27" stroke="currentColor" strokeWidth={S} />
      <circle cx="55" cy="12" r="3" stroke="currentColor" strokeWidth="1.3" opacity="0.75" />
      <circle cx="47" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
      <circle cx="39" cy="4" r="1.8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      {/* lamp and cowcatcher up front */}
      <circle cx="63" cy="31" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M60 38 L66 46 L60 46 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.2" />
      {/* wheels: small under the boiler, big driver under the cab */}
      <circle cx="19" cy="49" r="5" stroke="currentColor" strokeWidth={S} />
      <circle cx="38" cy="50" r="3.6" stroke="currentColor" strokeWidth={S} />
      <circle cx="52" cy="50" r="3.6" stroke="currentColor" strokeWidth={S} />
      <circle cx="19" cy="49" r="1.3" fill="currentColor" />
    </g>
  );
}

const TRAVELLERS: Record<TripType, (p: TravellerProps) => JSX.Element> = {
  motocamping: CatChaseTraveller,
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
