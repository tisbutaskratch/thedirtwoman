import type { ReactNode } from "react";
import type { SectionKey } from "@/api/types";
import { Icon } from "@/components/ui";

/**
 * A section, with a control for keeping it at the top.
 *
 * A wrapper rather than a prop on every section, because there are a dozen
 * sections written by hand over months and threading pinning through all of
 * them would mean editing all of them, forever, every time this changes.
 *
 * The control stays invisible until the section is hovered or focused, so a
 * page of twelve sections is not also a page of twelve pins.
 */
export default function SectionFrame({
  section,
  pinned,
  onToggle,
  children,
}: {
  section: SectionKey;
  pinned: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="group/frame relative">
      <button
        type="button"
        onClick={onToggle}
        title={pinned ? `Unpin ${section}` : `Pin ${section} to the top`}
        aria-pressed={pinned}
        className={`absolute -top-1 right-0 z-10 rounded-full p-1.5 transition-colors ${
          pinned
            ? "text-accent"
            : "text-content-subtle opacity-0 hover:text-content focus-visible:opacity-100 group-hover/frame:opacity-100"
        }`}
      >
        <Icon name={pinned ? "unpin" : "pin"} size={14} />
      </button>
      {children}
    </div>
  );
}
