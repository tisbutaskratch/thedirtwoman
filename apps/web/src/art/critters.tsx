/*
 * The Critters.
 *
 * An original cast of small, slightly disreputable creatures who hide around
 * the app. They are deliberately not anybody else's characters — these are
 * drawn from scratch for this project, so they can be shipped without
 * borrowing someone's designs.
 *
 * Rules of the cast:
 *  - one flat body colour, heavy outline, two dot eyes (neobrutalist)
 *  - each has one physical gag that reads at 24px
 *  - they never sit in a content area; only in the slack space of a heading
 *
 * Meet them:
 *  Blob    — a round green one who is always mid-yawn
 *  Sprout  — a twig-legged one with a leaf on its head, permanently startled
 *  Lumpy   — a wide purple one, arms folded, deeply unimpressed
 *  Peeker  — mostly eyes, clinging to an edge, watching you
 *  Snoozer — an orange crescent, asleep, emitting one Z
 */

export type CritterName = "blob" | "sprout" | "lumpy" | "peeker" | "snoozer";

interface CritterProps {
  size?: number;
  className?: string;
}

const OUTLINE = 1.7;

function Body({ size = 28, className = "", children }: CritterProps & { children: React.ReactNode }) {
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

/** Eyes shared by the whole cast, so they read as one family. */
function Eyes({ cx = 16, cy = 15, spread = 4 }: { cx?: number; cy?: number; spread?: number }) {
  return (
    <>
      <circle cx={cx - spread} cy={cy} r="1.5" fill="currentColor" />
      <circle cx={cx + spread} cy={cy} r="1.5" fill="currentColor" />
    </>
  );
}

export function Blob({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path
        d="M6 24 Q4 12 16 11 Q28 12 26 24 Z"
        stroke="currentColor"
        strokeWidth={OUTLINE}
        fill="currentColor"
        fillOpacity="0.22"
      />
      <Eyes cy={17} />
      {/* mid-yawn */}
      <ellipse cx="16" cy="21.5" rx="2.6" ry="2" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M9 24 L9 27 M23 24 L23 27" stroke="currentColor" strokeWidth={OUTLINE} />
    </Body>
  );
}

export function Sprout({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      {/* leaf, the entire personality */}
      <path d="M16 10 Q16 4 21 4 Q21 9 16 10" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity="0.3" />
      <ellipse
        cx="16"
        cy="17"
        rx="7"
        ry="7"
        stroke="currentColor"
        strokeWidth={OUTLINE}
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* startled: wide eyes, tiny mouth */}
      <circle cx="13" cy="16" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="19" cy="16" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="13" cy="16" r="0.8" fill="currentColor" />
      <circle cx="19" cy="16" r="0.8" fill="currentColor" />
      <circle cx="16" cy="20.5" r="1" stroke="currentColor" strokeWidth="1.2" />
      {/* twig legs */}
      <path d="M13 24 L12 29 M19 24 L20 29" stroke="currentColor" strokeWidth={OUTLINE} />
    </Body>
  );
}

export function Lumpy({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <rect
        x="4"
        y="11"
        width="24"
        height="15"
        rx="6"
        stroke="currentColor"
        strokeWidth={OUTLINE}
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* half-lidded, unimpressed */}
      <path d="M10 16 L14 16 M18 16 L22 16" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M13 21 L19 21" stroke="currentColor" strokeWidth={OUTLINE} />
      {/* folded arms */}
      <path d="M9 23 Q16 25 23 23" stroke="currentColor" strokeWidth={OUTLINE} />
    </Body>
  );
}

export function Peeker({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      {/* the edge it's clinging to */}
      <path d="M2 22 L30 22" stroke="currentColor" strokeWidth={OUTLINE} />
      <path
        d="M9 22 Q9 12 16 12 Q23 12 23 22 Z"
        stroke="currentColor"
        strokeWidth={OUTLINE}
        fill="currentColor"
        fillOpacity="0.2"
      />
      <circle cx="13" cy="17" r="2.4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="19" cy="17" r="2.4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="13.6" cy="17.4" r="1" fill="currentColor" />
      <circle cx="19.6" cy="17.4" r="1" fill="currentColor" />
      {/* fingers over the edge */}
      <path d="M11 22 L11 24 M14 22 L14 24 M18 22 L18 24 M21 22 L21 24" stroke="currentColor" strokeWidth="1.3" />
    </Body>
  );
}

export function Snoozer({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path
        d="M5 24 Q5 14 16 14 Q27 14 27 24 Z"
        stroke="currentColor"
        strokeWidth={OUTLINE}
        fill="currentColor"
        fillOpacity="0.22"
      />
      {/* asleep */}
      <path d="M11 19 Q13 21 15 19" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M18 19 Q20 21 22 19" stroke="currentColor" strokeWidth={OUTLINE} />
      {/* one Z, floating */}
      <path d="M22 9 L27 9 L22 13 L27 13" stroke="currentColor" strokeWidth="1.4" />
    </Body>
  );
}

export const CRITTERS: Record<CritterName, (p: CritterProps) => JSX.Element> = {
  blob: Blob,
  sprout: Sprout,
  lumpy: Lumpy,
  peeker: Peeker,
  snoozer: Snoozer,
};

/**
 * A critter tucked into the slack space of a section heading.
 *
 * Tinted with its section's own hue and kept a step below full strength:
 * visible enough that you actually notice them, muted enough that they never
 * compete with the heading. They come fully up on hover of the section,
 * which is the reward for looking.
 */
export default function Critter({
  name,
  size = 26,
  className = "",
}: {
  name: CritterName;
  size?: number;
  className?: string;
}) {
  const C = CRITTERS[name];
  return (
    <span
      aria-hidden
      className={`pointer-events-none select-none opacity-70 transition-opacity duration-300 group-hover/section:opacity-100 ${className}`}
    >
      <C size={size} />
    </span>
  );
}

/**
 * Deterministic critter for a given key, so the same section always hides
 * the same one — they're residents, not random noise.
 */
export function critterFor(key: string): CritterName {
  const names = Object.keys(CRITTERS) as CritterName[];
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return names[hash % names.length];
}
