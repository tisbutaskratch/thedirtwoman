import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import Critter from "@/art/critters";
import ThemeToggle from "@/components/ThemeToggle";
import { Emoji } from "@/components/ui";

export default function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface px-4 text-content">
      {/* Soft accent wash so the auth screens aren't a flat empty rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 text-lg font-bold tracking-tight"
        >
          <Emoji glyph="🧭" size="lg" />
          Adventure Planner
        </Link>
        <div className="relative rounded-card border border-edge bg-surface-raised p-6 shadow-xl">
          {/*
           * A raccoon leaning on the top edge of the card, waving. It lives
           * only on the sign-in screens, so arriving at the app has one face
           * that belongs to it and turns up nowhere else.
           */}
          <Critter
            name="raccoon"
            size={46}
            className="absolute -top-[34px] right-5 text-amber-400 opacity-100"
          />
          <h1 className="mb-5 text-xl font-semibold">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
