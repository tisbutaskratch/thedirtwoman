import type { Collaborator } from "@/api/types";
import { inputClass } from "@/components/ui";
import { ALL_ASSIGNEE } from "@/lib/assignment";

/**
 * One dropdown shape for every "who's doing this?" field, so the packing
 * list, the prep checklist and the timeline todos all offer the same
 * choices in the same order.
 *
 * `variant="chip"` is the compact inline pill used on saved rows; the
 * default is the full-width field used inside add/edit forms.
 */
export default function AssigneeSelect({
  value,
  onChange,
  roster,
  className = "",
  compact = false,
  variant = "field",
  highlighted = false,
}: {
  value: string;
  onChange: (value: string) => void;
  roster: Collaborator[];
  className?: string;
  compact?: boolean;
  variant?: "field" | "chip";
  highlighted?: boolean;
}) {
  const chipClass = `shrink-0 rounded-full border px-1.5 py-0 text-[11px] outline-none ${
    highlighted
      ? "border-violet-800/60 bg-violet-950/50 text-violet-300"
      : "border-edge bg-surface-overlay text-content-muted"
  }`;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Assign to"
      className={
        variant === "chip"
          ? `${chipClass} ${className}`
          : `${inputClass} ${compact ? "py-1 text-xs" : ""} ${className}`
      }
    >
      <option value="">Unassigned</option>
      <option value={ALL_ASSIGNEE}>Everyone</option>
      {roster.map((c) => (
        <option key={c.user_id} value={c.user_id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
