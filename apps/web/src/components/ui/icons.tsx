/*
 * Every action icon in the app comes from here.
 *
 * Actions are line icons from a single package (lucide-react) so stroke
 * weight, corner radius and optical size match everywhere. Decorative
 * glyphs stay as emoji — rendered through <Emoji> so they share one size
 * and one font — which keeps the playful bits playful without mixing two
 * competing line-icon styles.
 */
import {
  Archive,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Heart,
  Link2,
  Mail,
  MapPin,
  Minus,
  Moon,
  Pencil,
  Phone,
  Plus,
  Share2,
  Sun,
  Ticket,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";

export type { LucideIcon };

/** Named by intent rather than by shape, so swapping a glyph is one edit. */
export const Icons = {
  add: Plus,
  close: X,
  confirm: Check,
  edit: Pencil,
  remove: Minus,
  delete: Trash2,
  archive: Archive,
  back: ArrowLeft,
  share: Link2,
  download: Download,
  expand: ChevronDown,
  collapse: ChevronRight,
  light: Sun,
  dark: Moon,
  phone: Phone,
  address: MapPin,
  confirmation: Ticket,
  support: Heart,
  tellAFriend: Share2,
  feedback: Mail,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof Icons;

/** One size scale for action icons; 16px is the default inline size. */
export function Icon({
  name,
  size = 16,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Cmp = Icons[name];
  return <Cmp size={size} strokeWidth={1.75} className={className} aria-hidden />;
}

/**
 * Decorative emoji at a fixed optical size.
 *
 * Emoji render differently per platform, so the stylesheet prefers Noto
 * Color Emoji (the Android set) with a system fallback — that keeps the
 * playful glyphs looking the same everywhere instead of Apple on a Mac
 * and something else on Windows.
 */
export function Emoji({
  glyph,
  size = "md",
  className = "",
}: {
  glyph: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };
  return (
    <span aria-hidden className={`font-emoji leading-none ${sizes[size]} ${className}`}>
      {glyph}
    </span>
  );
}
