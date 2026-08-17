import { Link } from "react-router-dom";
import Critter from "@/art/critters";
import { Card, Icon } from "@/components/ui";
import { contactLinks, profile } from "@/lib/profile";

export default function Contact() {
  return (
    <div className="flex flex-col gap-10">
      <header className="relative">
        <Critter
          name="puffin"
          size={42}
          className="absolute -top-2 right-0 hidden text-accent opacity-100 sm:block"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-content-muted">
          Open to software engineering roles where the hard part is the system, not the org chart.
          Email is the surest way to reach me.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {contactLinks.map((link) => {
          const isPlain = link.href === "#";
          const inner = (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-edge bg-surface-overlay text-content-muted">
                <Icon name={link.icon} size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-wider text-content-subtle">
                  {link.label}
                </span>
                <span className="block truncate text-sm font-medium text-content">{link.value}</span>
              </span>
            </>
          );

          return (
            <Card key={link.label} padded={false}>
              {isPlain ? (
                <div className="flex items-center gap-3 p-4">{inner}</div>
              ) : (
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 rounded-card p-4 transition-colors hover:bg-surface-overlay"
                >
                  {inner}
                </a>
              )}
            </Card>
          );
        })}
      </div>

      {/* The other half of the round trip: someone arriving here from the app
          can read the resume, and someone reading the resume can go and use
          the thing it describes. */}
      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Critter name="otter" size={38} className="shrink-0 text-accent opacity-100" />
          <div>
            <h2 className="font-semibold text-content">Rather see the code run?</h2>
            <p className="mt-0.5 text-sm text-content-muted">
              Adventure Planner is live, built by {profile.name.split(" ")[0]} end to end.
            </p>
          </div>
        </div>
        <Link
          to="/app/dashboard"
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          <Icon name="share" size={15} />
          Open the app
        </Link>
      </Card>
    </div>
  );
}
