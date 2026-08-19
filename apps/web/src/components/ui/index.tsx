import { useEffect, type ReactNode } from "react";
import Critter, { critterFor, looseCritterFor } from "@/art/critters";
import { Emoji, Icon, type IconName } from "@/components/ui/icons";

export { Emoji, Icon } from "@/components/ui/icons";
export type { IconName } from "@/components/ui/icons";

/*
 * Shared UI primitives.
 *
 * Every trip section was previously hand-rolling the same border/padding/
 * text classes, which is why spacing and colour drifted between them. These
 * wrap the handful of shapes the app actually uses so a section only has to
 * say what it is, not how it looks.
 */

export type Tone = "emerald" | "cyan" | "sky" | "violet" | "fuchsia" | "rose" | "orange" | "amber";

/** Tinted-surface + text pairs per hue, at the one contrast level we use. */
export const TONE_SOFT: Record<Tone, string> = {
  emerald: "bg-emerald-950/50 text-emerald-300 border-emerald-800/60",
  cyan: "bg-cyan-950/50 text-cyan-300 border-cyan-800/60",
  sky: "bg-sky-950/50 text-sky-300 border-sky-800/60",
  violet: "bg-violet-950/50 text-violet-300 border-violet-800/60",
  fuchsia: "bg-fuchsia-950/50 text-fuchsia-300 border-fuchsia-800/60",
  rose: "bg-rose-950/50 text-rose-300 border-rose-800/60",
  orange: "bg-orange-950/50 text-orange-300 border-orange-800/60",
  amber: "bg-amber-950/50 text-amber-300 border-amber-800/60",
};

export const TONE_TEXT: Record<Tone, string> = {
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  sky: "text-sky-400",
  violet: "text-violet-400",
  fuchsia: "text-fuchsia-400",
  rose: "text-rose-400",
  orange: "text-orange-400",
  amber: "text-amber-400",
};

export const TONE_EDGE: Record<Tone, string> = {
  emerald: "border-l-emerald-500",
  cyan: "border-l-cyan-500",
  sky: "border-l-sky-500",
  violet: "border-l-violet-500",
  fuchsia: "border-l-fuchsia-500",
  rose: "border-l-rose-500",
  orange: "border-l-orange-500",
  amber: "border-l-amber-500",
};

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-card border border-edge bg-surface-raised ${padded ? "p-4" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/** Section heading with a decorative glyph, optional count, and action slot. */
export function SectionHeader({
  glyph,
  title,
  count,
  meta,
  tone = "emerald",
  actions,
}: {
  glyph: string;
  title: string;
  count?: number;
  /**
   * A small derived fact that belongs to the heading rather than the body:
   * total pack weight, tasks left. Deliberately quiet: it is context, not a
   * metric worth its own card.
   */
  meta?: ReactNode;
  tone?: Tone;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${TONE_SOFT[tone]}`}
      >
        <Emoji glyph={glyph} size="md" />
      </span>
      <h2 className="text-lg font-semibold tracking-tight text-content">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-xs font-medium text-content-muted">
          {count}
        </span>
      )}
      {meta && <span className="text-xs text-content-subtle">{meta}</span>}
      {/*
       * A resident critter loiters in the gap between the heading and its
       * controls. Same one every time for a given section. They live here.
       * Hidden on small screens, where there is no gap to loiter in.
       */}
      <Critter
        name={critterFor(title)}
        size={24}
        className={`ml-2 hidden sm:block ${TONE_TEXT[tone]}`}
      />
      <div className="ml-auto flex items-center gap-1">{actions}</div>
    </div>
  );
}

export function IconButton({
  icon,
  onClick,
  title,
  variant = "ghost",
  disabled,
  type = "button",
  size = 16,
}: {
  icon: IconName;
  onClick?: () => void;
  title: string;
  variant?: "ghost" | "confirm" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  size?: number;
}) {
  const variants = {
    ghost: "text-content-subtle hover:text-content hover:bg-surface-overlay",
    confirm: "text-accent hover:text-accent-hover hover:bg-accent-muted",
    danger: "text-content-subtle hover:text-rose-400 hover:bg-rose-950/40",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-40 ${variants[variant]}`}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

/** Bento-style metric tile: the derived numbers that make a mode feel planned. */
export function StatTile({
  label,
  value,
  unit,
  hint,
  tone = "emerald",
  status,
}: {
  label: string;
  /** `null` means "nothing recorded" and renders as words, never a dash. */
  value: ReactNode;
  unit?: string;
  hint?: string;
  tone?: Tone;
  status?: "ok" | "warn" | "none";
}) {
  const statusRing =
    status === "ok"
      ? "ring-1 ring-emerald-700/50"
      : status === "warn"
        ? "ring-1 ring-amber-600/60"
        : "";
  const isBlank = value === null || value === undefined || value === "";
  return (
    <div className={`rounded-card border border-edge bg-surface-raised p-3 ${statusRing}`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">{label}</p>
      {isBlank ? (
        <p className="mt-1 text-base font-normal italic text-content-subtle">Not set</p>
      ) : (
        <p className={`mt-1 text-xl font-semibold tabular-nums ${TONE_TEXT[tone]}`}>
          {value}
          {unit && <span className="ml-1 text-xs font-normal text-content-muted">{unit}</span>}
        </p>
      )}
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-content-subtle">{hint}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "emerald",
  soft = true,
}: {
  children: ReactNode;
  tone?: Tone;
  soft?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        soft ? TONE_SOFT[tone] : `border-edge bg-surface-overlay text-content-muted`
      }`}
    >
      {children}
    </span>
  );
}

export const inputClass =
  "w-full rounded-md border border-edge bg-surface-sunken px-3 py-2 text-sm text-content outline-none transition-colors placeholder:text-content-subtle focus:border-accent";

export function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: ReactNode;
  span?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${span ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
        {label}
      </span>
      {children}
    </label>
  );
}

export function EmptyState({ glyph, message }: { glyph: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-edge px-4 py-8 text-center">
      <div className="flex items-end gap-2 text-content-subtle">
        <Emoji glyph={glyph} size="xl" className="opacity-60" />
        {/* Someone keeping the empty section company. */}
        <Critter name={looseCritterFor(message)} size={30} />
      </div>
      <p className="text-sm text-content-subtle">{message}</p>
    </div>
  );
}

/**
 * Placeholder for an empty cell. Deliberately a word rather than a dash,
 * because a "–" sitting in a table reads as the remove control.
 */
export function EmptyHint({ children = "Nothing yet" }: { children?: ReactNode }) {
  return <span className="text-xs italic text-content-subtle">{children}</span>;
}

export function Section({
  glyph,
  title,
  count,
  meta,
  tone = "emerald",
  actions,
  children,
  className = "",
}: {
  glyph: string;
  title: string;
  count?: number;
  meta?: ReactNode;
  tone?: Tone;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`group/section flex flex-col gap-3 ${className}`}>
      <SectionHeader
        glyph={glyph}
        title={title}
        count={count}
        meta={meta}
        tone={tone}
        actions={actions}
      />
      {children}
    </section>
  );
}

/**
 * Collapsible add-form shell.
 *
 * Cancel and confirm sit together on one compact row aligned right, rather
 * than a close button eating a full row at the top and the submit stranded
 * at the bottom.
 */
export function AddForm({
  onSubmit,
  onClose,
  submitting,
  submitTitle = "Add",
  children,
}: {
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitting?: boolean;
  submitTitle?: string;
  children: ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-card border border-edge bg-surface-overlay p-3"
    >
      {children}
      <div className="flex items-center gap-1">
        {/* A critter leaning in to see what you're typing. */}
        <Critter name={looseCritterFor(submitTitle)} size={22} className="mr-auto" />
        <IconButton onClick={onClose} title="Cancel" icon="close" />
        {/* The confirm reads a touch larger. It's the action you want. */}
        <IconButton
          type="submit"
          title={submitTitle}
          variant="confirm"
          icon="confirm"
          size={19}
          disabled={submitting}
        />
      </div>
    </form>
  );
}

/** Modal confirmation for destructive or hard-to-undo actions. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  tone = "rose",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "rose" | "amber";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass =
    tone === "rose"
      ? "bg-rose-600 hover:bg-rose-500 text-white"
      : "bg-amber-600 hover:bg-amber-500 text-white";

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={title}
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-card border border-edge bg-surface-raised p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold text-content">{title}</h3>
        <p className="mt-1.5 text-sm text-content-muted">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-edge px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-edge-strong hover:text-content"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
