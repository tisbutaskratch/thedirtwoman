import type { RequiredLevel } from "@/api/types";

export const REQUIRED_LEVELS: RequiredLevel[] = ["required", "optional"];

export const REQUIRED_LEVEL_LABEL: Record<RequiredLevel, string> = {
  required: "Required",
  optional: "Optional",
};

export const REQUIRED_LEVEL_STYLE: Record<RequiredLevel, string> = {
  required: "border-rose-800/60 bg-rose-950/50 text-rose-300",
  optional: "border-amber-800/60 bg-amber-950/50 text-amber-300",
};

/**
 * The required/optional pill, as an inline dropdown.
 *
 * Shared between the packing list and the prep checklist so the same word
 * carries the same colour in both. A red "Required" means the trip doesn't
 * happen without it, wherever you see it.
 */
export default function RequiredLevelChip({
  value,
  onChange,
}: {
  value: RequiredLevel;
  onChange: (level: RequiredLevel) => void;
}) {
  return (
    <select
      value={value}
      aria-label="Required level"
      onChange={(e) => onChange(e.target.value as RequiredLevel)}
      className={`rounded-full border px-1.5 py-0 text-[11px] outline-none ${REQUIRED_LEVEL_STYLE[value]}`}
    >
      {REQUIRED_LEVELS.map((level) => (
        <option key={level} value={level} className="bg-surface text-content">
          {REQUIRED_LEVEL_LABEL[level]}
        </option>
      ))}
    </select>
  );
}
