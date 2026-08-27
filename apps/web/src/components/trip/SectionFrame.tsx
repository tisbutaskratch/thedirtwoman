import { useMemo, type ReactNode } from "react";
import type { SectionKey } from "@/api/types";
import { SectionPinContext } from "@/lib/sectionPin";

/**
 * Makes one section pinnable.
 *
 * The control itself is rendered by SectionHeader, in the row of buttons it
 * already lays out. This only supplies it, by context, so that a dozen
 * sections written before pinning existed did not all have to change.
 */
export default function SectionFrame({
  section,
  label,
  pinned,
  onToggle,
  children,
}: {
  section: SectionKey;
  /** Human name of the section, for the button's tooltip. */
  label: string;
  pinned: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      pinned,
      onToggle,
      label: pinned ? `Unpin ${label}` : `Pin ${label} to the top`,
    }),
    [pinned, onToggle, label],
  );
  return (
    <SectionPinContext.Provider value={value}>
      <div key={section}>{children}</div>
    </SectionPinContext.Provider>
  );
}
