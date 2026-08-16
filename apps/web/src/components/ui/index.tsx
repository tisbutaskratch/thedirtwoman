import type { ReactNode } from "react";

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

/** Section heading with an emoji glyph, optional count, and an action slot. */
export function SectionHeader({
  icon,
  title,
  count,
  tone = "emerald",
  actions,
}: {
  icon: string;
  title: string;
  count?: number;
  tone?: Tone;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-base ${TONE_SOFT[tone]}`}
      >
        {icon}
      </span>
      <h2 className="text-lg font-semibold tracking-tight text-content">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-xs font-medium text-content-muted">
          {count}
        </span>
      )}
      <div className="ml-auto flex items-center gap-1">{actions}</div>
    </div>
  );
}

export function IconButton({
  onClick,
  title,
  children,
  variant = "ghost",
  disabled,
  type = "button",
}: {
  onClick?: () => void;
  title: string;
  children: ReactNode;
  variant?: "ghost" | "confirm" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const variants = {
    ghost: "text-content-subtle hover:text-content hover:bg-surface-overlay",
    confirm: "text-accent hover:text-accent-hover hover:bg-accent-muted text-lg",
    danger: "text-content-subtle hover:text-rose-400 hover:bg-rose-950/40",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md leading-none transition-colors disabled:opacity-40 ${variants[variant]}`}
    >
      {children}
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
  return (
    <div className={`rounded-card border border-edge bg-surface-raised p-3 ${statusRing}`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${TONE_TEXT[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-content-muted">{unit}</span>}
      </p>
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
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
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

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-card border border-dashed border-edge px-4 py-8 text-center">
      <span aria-hidden className="text-2xl opacity-60">
        {icon}
      </span>
      <p className="text-sm text-content-subtle">{message}</p>
    </div>
  );
}

/** Wrapper that gives every section the same rhythm and reveal-form behaviour. */
export function Section({
  icon,
  title,
  count,
  tone = "emerald",
  actions,
  children,
  className = "",
}: {
  icon: string;
  title: string;
  count?: number;
  tone?: Tone;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-3 ${className}`}>
      <SectionHeader icon={icon} title={title} count={count} tone={tone} actions={actions} />
      {children}
    </section>
  );
}

/** The collapsible add-form shell: × top-right, content, ✓ to submit. */
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
      className="flex flex-col gap-3 rounded-card border border-edge bg-surface-overlay p-4"
    >
      <div className="flex justify-end">
        <IconButton onClick={onClose} title="Close">
          ×
        </IconButton>
      </div>
      {children}
      <div className="flex justify-end">
        <IconButton type="submit" title={submitTitle} variant="confirm" disabled={submitting}>
          ✓
        </IconButton>
      </div>
    </form>
  );
}
