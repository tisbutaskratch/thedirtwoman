import { createContext, useContext } from "react";

/**
 * The pin control for whichever section is being rendered.
 *
 * Passed by context rather than by prop because a dozen sections were
 * written before pinning existed, and threading a prop through all of them
 * would mean editing all of them again the next time this changes.
 *
 * It exists so SectionHeader can put the pin in the row of controls it
 * already lays out. The first attempt floated it absolutely over the
 * corner, where it landed on top of each section's own add button.
 */
export interface SectionPinControl {
  pinned: boolean;
  onToggle: () => void;
  label: string;
}

export const SectionPinContext = createContext<SectionPinControl | null>(null);

/** Null outside a pinnable section, which is a normal state, not an error. */
export function useSectionPin(): SectionPinControl | null {
  return useContext(SectionPinContext);
}
