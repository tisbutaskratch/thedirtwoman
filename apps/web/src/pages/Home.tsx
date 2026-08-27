import { Link } from "react-router-dom";
import Critter from "@/art/critters";
import { Badge, Card, Icon, StatTile } from "@/components/ui";
import { profile, projects, roles, stats } from "@/lib/profile";

export default function Home() {
  const current = roles[0];
  const featured = projects[0];

  return (
    <div className="flex flex-col gap-14">
      {/* ---------------------------------------------------------- hero */}
      <section className="relative">
        {/* Two critters loitering in the hero's margin, one high one low, so
            the space beside the text is doing something. */}
        <Critter
          name="otter"
          size={44}
          className="absolute -top-4 right-0 hidden text-accent opacity-100 lg:block"
        />

        <p className="flex items-center gap-2 text-sm font-medium text-accent">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          {current.title} at {current.company}
        </p>

        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          {profile.name}
        </h1>

        <p className="mt-3 max-w-2xl text-lg text-accent sm:text-xl">{profile.tagline}</p>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-content-muted">
          {profile.summary}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/experience"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
          >
            See the work
            <Icon name="collapse" size={15} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-edge px-5 py-2.5 text-sm font-medium text-content-muted transition-colors hover:border-edge-strong hover:text-content"
          >
            <Icon name="feedback" size={15} />
            Get in touch
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------- numbers */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
        ))}
      </section>

      {/* -------------------------------------------------- the pivot */}
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface-raised p-6 sm:p-8">
        <Critter
          name="koala"
          size={40}
          className="absolute right-5 top-5 hidden text-accent opacity-100 sm:block"
        />
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          What I have been building since going back to engineering
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-content-muted">
          I shipped Carrier Choice, which lets EU and UK shoppers pick their own return carrier. I
          automated Ship By Loop merchant onboarding against Salesforce. I carried three legacy
          integrations onto a platform I did not previously own. Right now I am leading a migration
          of every merchant off per-carrier hardcoded label fields onto a provider-agnostic
          capability model. Before this I managed engineers for two and a half years. I was decent
          at it, and I missed the work itself, the design docs and the code review and being the
          person who builds the thing. I kept the habits worth keeping, which mostly means writing
          things down and telling people before they have to ask.
        </p>
        <Link
          to="/about"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          The longer version
          <Icon name="collapse" size={14} />
        </Link>
      </section>

      {/* ------------------------------------------------ featured build */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Something you can go and use
          </h2>
          <Critter name="crab" size={26} className="text-accent opacity-100" />
        </div>

        <Card className="flex flex-col gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-content">{featured.title}</h3>
              <p className="mt-0.5 text-sm text-content-subtle">
                {featured.role} · {featured.period}
              </p>
            </div>
            <Badge tone="violet">{featured.status}</Badge>
          </div>

          <p className="max-w-3xl text-sm leading-relaxed text-content-muted">
            {featured.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {featured.tags.map((tag) => (
              <Badge key={tag} tone="cyan">
                {tag}
              </Badge>
            ))}
          </div>

          {featured.href && (
            <a
              href={featured.href}
              className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              <Icon name="share" size={15} />
              {featured.linkLabel}
            </a>
          )}
        </Card>
      </section>
    </div>
  );
}
