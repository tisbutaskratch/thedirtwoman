/*
 * The Critters.
 *
 * An original cast of small creatures who live around the app. They are
 * deliberately not anybody else's characters — every one is drawn from
 * scratch for this project.
 *
 * The cast is animals: birds, bugs and small mammals, plus the handful of
 * odder residents that earned their place. Abstract blobs and shapes-with-
 * faces were tried and cut; a critter you can name is a lot more charming
 * than a rounded rectangle looking cross.
 *
 * Rules of the cast:
 *  - one flat body, heavy outline, a face that reads at 24px
 *  - each has exactly one physical gag, and no two share it
 *  - they never sit in a content area; only in the slack space around one
 *
 * There are more of them than there are places to put them, so no two ever
 * appear twice on a page — repeats read as wallpaper instead of residents.
 */

export type CritterName =
  // The originals that stuck
  | "sprout"
  | "shelly"
  | "wiggler"
  | "beaky"
  | "ghost"
  // Bugs
  | "bee"
  | "butterfly"
  | "ladybug"
  | "snail"
  | "moth"
  // Birds
  | "owl"
  | "duckling"
  | "penguin"
  | "chick"
  // Small mammals
  | "fox"
  | "bunny"
  | "hedgehog"
  | "mouse"
  | "cat"
  | "bear"
  | "turtle"
  | "frog";

interface CritterProps {
  size?: number;
  className?: string;
}

const OUTLINE = 1.7;
const FILL = 0.2;

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

/** Eyes shared by the whole cast, so they read as one hand. */
function Eyes({ cx = 16, cy = 15, spread = 4, r = 1.5 }) {
  return (
    <>
      <circle cx={cx - spread} cy={cy} r={r} fill="currentColor" />
      <circle cx={cx + spread} cy={cy} r={r} fill="currentColor" />
    </>
  );
}

/* -------------------------------------------------- keepers ------------ */

/** Sprout: a leaf on its head and permanently startled. */
export function Sprout({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path
        d="M16 10 Q16 4 21 4 Q21 9 16 10"
        stroke="currentColor"
        strokeWidth={OUTLINE}
        fill="currentColor"
        fillOpacity={0.3}
      />
      <circle cx="16" cy="17" r="7" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <circle cx="13" cy="16" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="19" cy="16" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="13" cy="16" r="0.8" fill="currentColor" />
      <circle cx="19" cy="16" r="0.8" fill="currentColor" />
      <circle cx="16" cy="20.5" r="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 24 L12 29 M19 24 L20 29" stroke="currentColor" strokeWidth={OUTLINE} />
    </Body>
  );
}

/** Shelly: a snail, in no particular hurry. */
export function Shelly({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path
        d="M3 24 Q3 20 8 20 L20 20 Q24 20 24 24 Z"
        stroke="currentColor"
        strokeWidth={OUTLINE}
        fill="currentColor"
        fillOpacity={FILL}
      />
      <circle cx="13" cy="15" r="7" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M13 15 m0 -4 a4 4 0 1 1 -3 6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M24 22 Q28 22 28 18" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M27 18 L26 13 M29.5 18 L30.5 13.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="25.8" cy="12" r="1.2" fill="currentColor" />
      <circle cx="30.7" cy="12.5" r="1.2" fill="currentColor" />
    </Body>
  );
}

/** Wiggler: a segmented caterpillar, cheerfully undulating. */
export function Wiggler({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      {[6, 12, 18].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={i % 2 ? 21 : 18}
          r="4"
          stroke="currentColor"
          strokeWidth={OUTLINE}
          fill="currentColor"
          fillOpacity={FILL}
        />
      ))}
      <circle cx="25" cy="17" r="5.5" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <circle cx="23.5" cy="16" r="1.3" fill="currentColor" />
      <circle cx="27" cy="16" r="1.3" fill="currentColor" />
      <path d="M23 20 Q25 21.5 27 20" stroke="currentColor" strokeWidth="1.3" />
      <path d="M23 12 L21.5 8 M27 12 L28.5 8" stroke="currentColor" strokeWidth="1.3" />
    </Body>
  );
}

/** Beaky: a small round bird, side-on, mildly affronted. */
export function Beaky({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <ellipse cx="15" cy="17" rx="8" ry="7.5" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <path d="M11 17 Q16 14 19 19 Q15 21 11 17 Z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="20" cy="14" r="1.4" fill="currentColor" />
      <path d="M23 16 L28 17.5 L23 19 Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity={0.4} />
      <path d="M13 24.5 L13 28 M18 24.5 L18 28" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 28 L15 28 M16 28 L20 28" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 9.5 L13 5.5" stroke="currentColor" strokeWidth="1.3" />
    </Body>
  );
}

/** Ghost: fast asleep, or possibly haunting. Nobody has asked. */
export function Ghost({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path
        d="M5 26 Q5 12 16 12 Q27 12 27 26 L23.5 23 L20 26 L16 23 L12 26 L8.5 23 Z"
        stroke="currentColor"
        strokeWidth={OUTLINE}
        fill="currentColor"
        fillOpacity={0.22}
      />
      <path d="M11 18 Q13 20 15 18" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M18 18 Q20 20 22 18" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M22 7 L27 7 L22 11 L27 11" stroke="currentColor" strokeWidth="1.4" />
    </Body>
  );
}

/* -------------------------------------------------- bugs --------------- */

/** Bee: round, striped, and working. */
export function Bee({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      {/* wings, behind */}
      <ellipse cx="12" cy="11" rx="5" ry="3.5" transform="rotate(-25 12 11)" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity={0.12} />
      <ellipse cx="20" cy="11" rx="5" ry="3.5" transform="rotate(25 20 11)" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity={0.12} />
      <ellipse cx="16" cy="20" rx="8" ry="7" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      {/* stripes */}
      <path d="M13 13.8 L13 26.2 M18 13.8 L18 26.2" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      <Eyes cx={16} cy={18} spread={3.4} r={1.3} />
      <path d="M14 22 Q16 23.5 18 22" stroke="currentColor" strokeWidth="1.2" />
      {/* antennae */}
      <path d="M13 13.5 L11 9 M19 13.5 L21 9" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10.6" cy="8.4" r="1" fill="currentColor" />
      <circle cx="21.4" cy="8.4" r="1" fill="currentColor" />
    </Body>
  );
}

/** Butterfly: four wings and no particular destination. */
export function Butterfly({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M15 16 Q4 7 3 15 Q3 21 15 19 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <path d="M17 16 Q28 7 29 15 Q29 21 17 19 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <path d="M15 20 Q7 23 8 28 Q13 29 15 22 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity={0.14} />
      <path d="M17 20 Q25 23 24 28 Q19 29 17 22 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity={0.14} />
      {/* wing spots */}
      <circle cx="9" cy="14" r="1.6" fill="currentColor" opacity="0.6" />
      <circle cx="23" cy="14" r="1.6" fill="currentColor" opacity="0.6" />
      {/* body + antennae */}
      <ellipse cx="16" cy="19" rx="1.8" ry="6" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity={0.35} />
      <circle cx="16" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M14.8 10.4 Q12 6 13.5 4.5 M17.2 10.4 Q20 6 18.5 4.5" stroke="currentColor" strokeWidth="1.1" />
    </Body>
  );
}

/** Ladybug: spotted, domed, tidy. */
export function Ladybug({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M4 23 Q4 11 16 11 Q28 11 28 23 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      {/* wing seam + spots */}
      <path d="M16 11 L16 23" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="16" r="1.7" fill="currentColor" opacity="0.65" />
      <circle cx="22" cy="16" r="1.7" fill="currentColor" opacity="0.65" />
      <circle cx="11" cy="21" r="1.4" fill="currentColor" opacity="0.65" />
      <circle cx="21" cy="21" r="1.4" fill="currentColor" opacity="0.65" />
      {/* head */}
      <path d="M11 11 Q11 6 16 6 Q21 6 21 11 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={0.35} />
      <Eyes cx={16} cy={9} spread={2.4} r={1.1} />
      <path d="M13 6.5 L11.5 3 M19 6.5 L20.5 3" stroke="currentColor" strokeWidth="1.1" />
      {/* legs */}
      <path d="M5 23 L3 27 M16 23 L16 27 M27 23 L29 27" stroke="currentColor" strokeWidth="1.2" />
    </Body>
  );
}

/** Snail (the other one): shell forward, face out. */
export function Snail({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M4 25 Q4 21 9 21 L22 21 Q26 21 26 25 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <circle cx="19" cy="14" r="8" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={0.14} />
      <path d="M19 14 m0 -5 a5 5 0 1 1 -3.8 8.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 21 Q3 20 3.5 16" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M4 16 L2.5 11.5 M7 16.5 L8 12" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="2.2" cy="10.5" r="1.2" fill="currentColor" />
      <circle cx="8.3" cy="11" r="1.2" fill="currentColor" />
    </Body>
  );
}

/** Moth: fuzzy, winged, drawn to the nearest bright thing. */
export function Moth({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M15 17 Q4 10 3 19 Q4 27 15 21 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <path d="M17 17 Q28 10 29 19 Q28 27 17 21 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <ellipse cx="16" cy="19" rx="2.2" ry="6" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity={0.35} />
      <circle cx="16" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14.5 10 Q11 6 12 4 M17.5 10 Q21 6 20 4" stroke="currentColor" strokeWidth="1.2" />
    </Body>
  );
}

/* -------------------------------------------------- birds -------------- */

/** Owl: enormous eyes, ear tufts, no comment. */
export function Owl({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M5 20 Q5 8 16 8 Q27 8 27 20 Q27 28 16 28 Q5 28 5 20 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      {/* tufts */}
      <path d="M8 10 L6 4 L12 7 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity={0.3} />
      <path d="M24 10 L26 4 L20 7 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity={0.3} />
      {/* the eyes, which are the point */}
      <circle cx="11.5" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20.5" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11.5" cy="16" r="1.8" fill="currentColor" />
      <circle cx="20.5" cy="16" r="1.8" fill="currentColor" />
      <path d="M16 19 L14.5 21.5 L17.5 21.5 Z" fill="currentColor" />
      <path d="M11 26 L11 29 M21 26 L21 29" stroke="currentColor" strokeWidth="1.3" />
    </Body>
  );
}

/** Duckling: round, fluffy, faintly indignant. */
export function Duckling({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <ellipse cx="15" cy="20" rx="9" ry="7.5" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <circle cx="20" cy="11" r="6" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <circle cx="21" cy="10" r="1.4" fill="currentColor" />
      {/* bill */}
      <path d="M25 11 Q29 11.5 25.5 13.5 Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity={0.4} />
      {/* wing */}
      <path d="M12 19 Q17 17 19 22 Q14 24 12 19 Z" stroke="currentColor" strokeWidth="1.3" />
      {/* fluff */}
      <path d="M18 6 L17 3 M21 5.5 L21.5 2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 27 L11 30 M18 27 L19 30" stroke="currentColor" strokeWidth="1.3" />
    </Body>
  );
}

/** Penguin: upright, formal, slightly damp. */
export function Penguin({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M8 26 Q6 8 16 8 Q26 8 24 26 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      {/* belly */}
      <path d="M12 25 Q11 13 16 13 Q21 13 20 25 Z" stroke="currentColor" strokeWidth="1.3" />
      <Eyes cx={16} cy={13} spread={2.8} r={1.2} />
      <path d="M16 16 L14 18 L18 18 Z" fill="currentColor" />
      {/* flippers */}
      <path d="M8 15 Q4 19 7 23 M24 15 Q28 19 25 23" stroke="currentColor" strokeWidth="1.4" />
      {/* feet */}
      <path d="M11 26 Q9 29 13 29 M21 26 Q23 29 19 29" stroke="currentColor" strokeWidth="1.3" />
    </Body>
  );
}

/** Chick: newly hatched, still wearing half the shell. */
export function Chick({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <Eyes cx={16} cy={14} spread={3} r={1.3} />
      <path d="M16 17 L13.5 19 L18.5 19 Z" fill="currentColor" />
      {/* the shell cap it hasn't shaken off */}
      <path
        d="M7 12 L10 8 L13 11 L16 7 L19 11 L22 8 L25 12 Q16 9 7 12 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="currentColor"
        fillOpacity={0.3}
      />
      {/* shell bottom */}
      <path d="M8 22 L11 25 L14 22 L17 25 L20 22 L23 25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13 27 L13 29.5 M19 27 L19 29.5" stroke="currentColor" strokeWidth="1.2" />
    </Body>
  );
}

/* -------------------------------------------------- mammals ------------ */

/** Fox: pointed everything, enormous tail. */
export function Fox({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      {/* tail, curling round */}
      <path d="M6 24 Q-1 20 3 12 Q6 7 10 10" stroke="currentColor" strokeWidth="2.6" fill="none" />
      <path d="M9 25 Q9 16 17 16 Q25 16 25 25 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      {/* ears */}
      <path d="M12 17 L11 8 L18 13 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.3} />
      <path d="M23 17 L25 9 L18.5 13.5 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.3} />
      <Eyes cx={17.5} cy={20} spread={3.2} r={1.3} />
      {/* snout */}
      <path d="M25 22 L29.5 23.5 L25 25 Z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="29" cy="23.5" r="1" fill="currentColor" />
    </Body>
  );
}

/** Bunny: ears longer than sense. */
export function Bunny({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      {/* ears */}
      <ellipse cx="12" cy="9" rx="2.6" ry="7" transform="rotate(-12 12 9)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.25} />
      <ellipse cx="20" cy="9" rx="2.6" ry="7" transform="rotate(12 20 9)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.25} />
      <ellipse cx="16" cy="21" rx="8.5" ry="7" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <Eyes cx={16} cy={20} spread={3.4} r={1.3} />
      <path d="M16 22.5 L14.5 24 L17.5 24 Z" fill="currentColor" />
      <path d="M13 25.5 Q16 27 19 25.5" stroke="currentColor" strokeWidth="1.2" />
      {/* whiskers */}
      <path d="M8 22 L4.5 21 M8 24 L4.5 25 M24 22 L27.5 21 M24 24 L27.5 25" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </Body>
  );
}

/** Hedgehog: fully committed to the spikes. */
export function Hedgehog({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M4 24 Q4 12 15 12 Q26 12 26 24 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <path
        d="M5.5 17 L1.5 13.5 M9 13 L7 7.5 M14 12 L14 6 M19 12.5 L22 7 M24 16 L28.5 12.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {/* snout, poking out to the right */}
      <path d="M25 20 Q30 20.5 30 24 L25 24 Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity={0.3} />
      <circle cx="29.5" cy="21.5" r="1" fill="currentColor" />
      <circle cx="22" cy="19" r="1.4" fill="currentColor" />
      <path d="M8 24 L8 27 M16 24 L16 27" stroke="currentColor" strokeWidth="1.2" />
    </Body>
  );
}

/** Mouse: mostly ears, with a tail as an afterthought. */
export function Mouse({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M4 26 Q0 22 3 19" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <ellipse cx="16" cy="21" rx="9" ry="6.5" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      {/* the ears */}
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.25} />
      <circle cx="21" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.25} />
      <Eyes cx={17} cy={20} spread={3} r={1.3} />
      <path d="M25 22 L29 23 L25 24.5 Z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="28.5" cy="23" r="0.9" fill="currentColor" />
      <path d="M22 25 L26 26.5 M22 26.5 L25.5 28" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
    </Body>
  );
}

/** Cat: loafing, tail up, entirely at ease. */
export function Cat({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M6 25 Q0 21 3 15" stroke="currentColor" strokeWidth="2.2" fill="none" />
      <path d="M6 26 Q5 17 16 17 Q27 17 26 26 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <circle cx="21" cy="13" r="6.5" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      {/* ears */}
      <path d="M16 9 L16 3.5 L21 7 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity={0.3} />
      <path d="M26 9 L27 3.5 L21.5 6.5 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity={0.3} />
      <circle cx="18.8" cy="12.5" r="1.2" fill="currentColor" />
      <circle cx="23.5" cy="12.5" r="1.2" fill="currentColor" />
      <path d="M21.2 15 L21.2 16" stroke="currentColor" strokeWidth="1.4" />
      <path d="M26 13.5 L30 12.5 M26 15.5 L30 16" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
    </Body>
  );
}

/** Bear: round, sleepy, has definitely been in the cooler. */
export function Bear({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <circle cx="9" cy="11" r="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.25} />
      <circle cx="23" cy="11" r="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.25} />
      <circle cx="16" cy="17" r="9" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <Eyes cx={16} cy={15} spread={3.6} r={1.4} />
      {/* muzzle */}
      <ellipse cx="16" cy="20.5" rx="4" ry="3" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity={0.15} />
      <path d="M16 19 L14.5 20.5 L17.5 20.5 Z" fill="currentColor" />
      <path d="M16 20.5 L16 22.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9 27 L9 29.5 M23 27 L23 29.5" stroke="currentColor" strokeWidth="1.3" />
    </Body>
  );
}

/** Turtle: carrying the house, taking its time. */
export function Turtle({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <path d="M4 22 Q4 10 16 10 Q28 10 28 22 Z" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      {/* shell plates */}
      <path d="M16 10 L16 22 M9 13.5 L11 22 M23 13.5 L21 22 M6 17.5 L26 17.5" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
      {/* head */}
      <circle cx="29" cy="19" r="3.4" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity={0.25} />
      <circle cx="30" cy="18.3" r="1" fill="currentColor" />
      {/* feet */}
      <path d="M7 22 L5 26 L9 26 Z M17 22 L16 26 L21 26 Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity={0.2} />
    </Body>
  );
}

/** Frog: caught at the top of a hop. */
export function Frog({ size, className }: CritterProps) {
  return (
    <Body size={size} className={className}>
      <ellipse cx="16" cy="19" rx="9" ry="7" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={FILL} />
      <circle cx="11" cy="11" r="3.4" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={0.25} />
      <circle cx="21" cy="11" r="3.4" stroke="currentColor" strokeWidth={OUTLINE} fill="currentColor" fillOpacity={0.25} />
      <circle cx="11" cy="11" r="1.3" fill="currentColor" />
      <circle cx="21" cy="11" r="1.3" fill="currentColor" />
      <path d="M12 20 Q16 23 20 20" stroke="currentColor" strokeWidth={OUTLINE} />
      <path d="M7 24 Q4 28 8 29 M25 24 Q28 28 24 29" stroke="currentColor" strokeWidth="1.4" />
    </Body>
  );
}

export const CRITTERS: Record<CritterName, (p: CritterProps) => JSX.Element> = {
  sprout: Sprout,
  shelly: Shelly,
  wiggler: Wiggler,
  beaky: Beaky,
  ghost: Ghost,
  bee: Bee,
  butterfly: Butterfly,
  ladybug: Ladybug,
  snail: Snail,
  moth: Moth,
  owl: Owl,
  duckling: Duckling,
  penguin: Penguin,
  chick: Chick,
  fox: Fox,
  bunny: Bunny,
  hedgehog: Hedgehog,
  mouse: Mouse,
  cat: Cat,
  bear: Bear,
  turtle: Turtle,
  frog: Frog,
};

/**
 * Who lives where.
 *
 * Assigned by hand rather than hashed: a hash collides, and two identical
 * critters on one page immediately read as wallpaper. Where the pairing can
 * be a small joke, it is — the snail on Timeline, the hoarding hedgehog on
 * the packing list, the owl watching over who's doing what.
 */
const CRITTER_BY_SECTION: Record<string, CritterName> = {
  Crew: "sprout",
  Timeline: "shelly",
  Files: "mouse",
  "Packing list": "hedgehog",
  "Prep checklist": "beaky",
  Expenses: "bee",
  Locations: "fox",
  Notes: "wiggler",
  Screenshots: "ghost",
  "Who's doing what": "owl",
  // Mode panels — only one shows per trip, but they still get their own.
  "Trail plan": "frog",
  Campground: "bear",
  "Getting there": "turtle",
  "Rig & range": "moth",
  "Documents & logistics": "penguin",
};

/** The spare cast, for places that aren't a trip section. */
export const LOOSE_CRITTERS: CritterName[] = [
  "butterfly",
  "ladybug",
  "duckling",
  "chick",
  "bunny",
  "cat",
  "snail",
];

/**
 * The critter for a section. Falls back to a stable hash so a section added
 * later still gets a consistent resident rather than nothing.
 */
export function critterFor(key: string): CritterName {
  const assigned = CRITTER_BY_SECTION[key];
  if (assigned) return assigned;

  const names = Object.keys(CRITTERS) as CritterName[];
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return names[hash % names.length];
}

/** A stable pick from the spare cast, for empty states and the like. */
export function looseCritterFor(key: string): CritterName {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return LOOSE_CRITTERS[hash % LOOSE_CRITTERS.length];
}

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
