import Critter, { type CritterName } from "@/art/critters";
import { Badge, Card, Emoji } from "@/components/ui";
import { competencies, positioning, roles } from "@/lib/profile";

/** One resident per role, oldest to newest, so the column has faces down it. */
const ROLE_CRITTERS: CritterName[] = ["otter", "owl", "fox", "hedgehog", "bee", "shelly"];

export default function Experience() {
  return (
    <div className="flex flex-col gap-10">
      <header className="relative">
        <Critter
          name="dragonfly"
          size={42}
          className="absolute -top-2 right-0 hidden text-accent opacity-100 sm:block"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Experience</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-content-muted">{positioning}</p>
      </header>

      {/*
       * A single spine with the roles hanging off it. A timeline reads far
       * faster than a stack of cards when the question someone is actually
       * asking is "what order did this happen in, and is she still doing it?"
       */}
      <ol className="relative flex flex-col gap-8 border-l border-edge pl-6 sm:pl-8">
        {roles.map((role, i) => (
          <li key={`${role.company}-${role.start}`} className="relative">
            {/* the node on the spine */}
            <span
              className={`absolute -left-[calc(1.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full sm:-left-[calc(2rem+5px)] ${
                role.current ? "bg-accent ring-4 ring-accent-muted" : "bg-edge-strong"
              }`}
            />

            <Card className="relative flex flex-col gap-4">
              <Critter
                name={ROLE_CRITTERS[i % ROLE_CRITTERS.length]}
                size={30}
                className="absolute right-4 top-4 text-accent opacity-100"
              />

              <div className="pr-10">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-content">{role.title}</h2>
                  {role.current && <Badge tone="emerald">Current</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-content-muted">
                  {role.company} · {role.location}
                </p>
                <p className="mt-0.5 text-xs uppercase tracking-wider text-content-subtle">
                  {role.start} to {role.end}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-content-muted">{role.summary}</p>

              <ul className="flex flex-col gap-2">
                {role.highlights.map((highlight, h) => (
                  <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-content-muted">
                    <span
                      aria-hidden
                      className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 border-t border-edge pt-3">
                {role.tags.map((tag) => (
                  <Badge key={tag} tone="cyan">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          </li>
        ))}
      </ol>

      {/*
       * The level question, answered with evidence.
       *
       * A timeline says where someone worked. It doesn't say whether they
       * operate like a senior, a lead, or a staff engineer. This does, one
       * competency at a time, with what actually happened rather than
       * adjectives. No review ratings or manager quotes: those are private,
       * and quoting your own review reads as boasting regardless.
       */}
      <section className="flex flex-col gap-5 border-t border-edge pt-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">The case, with evidence</h2>
            <Critter name="owl" size={28} className="text-accent opacity-100" />
          </div>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-content-muted">
            If you are trying to work out what level this is, these are the axes that usually
            decide it. Each one lists what happened, not how I would describe myself.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {competencies.map((c) => (
            <Card key={c.name} className="flex flex-col gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-content">
                  <Emoji glyph={c.glyph} size="md" />
                  {c.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-content-subtle">{c.meaning}</p>
              </div>

              <ul className="flex flex-col gap-2">
                {c.evidence.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-content-muted">
                    <span
                      aria-hidden
                      className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
