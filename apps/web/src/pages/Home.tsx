import { Link } from "react-router-dom";
import { profile, projects, skills } from "@/lib/profile";
import { neonAt } from "@/lib/neonPalette";

export default function Home() {
  const highlights = [
    { label: "Skill areas", value: skills.length, icon: "🌿" },
    { label: "Projects", value: projects.length, icon: "🗺️" },
    {
      label: "Completed",
      value: projects.filter((p) => p.status === "Completed").length,
      icon: "✅",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface-raised p-8 sm:p-12">
        {/* Soft colour wash so the hero reads as designed rather than as a plain box. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {profile.location}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{profile.name}</h1>
          <p className="text-lg text-content-muted sm:text-xl">{profile.title}</p>
          <p className="max-w-xl text-content-muted">{profile.tagline}</p>

          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              to="/projects"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              See my work
            </Link>
            <Link
              to="/contact"
              className="rounded-md border border-edge px-5 py-2.5 text-sm font-semibold text-content transition-colors hover:border-edge-strong"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item, i) => {
          const colors = neonAt(i);
          return (
            <div
              key={item.label}
              className={`rounded-card border border-edge border-l-4 bg-surface-raised p-5 ${colors.border}`}
            >
              <span aria-hidden className="text-2xl">
                {item.icon}
              </span>
              <p className={`mt-2 text-3xl font-bold tabular-nums ${colors.text}`}>{item.value}</p>
              <p className="text-sm text-content-subtle">{item.label}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
