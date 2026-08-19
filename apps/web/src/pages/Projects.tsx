import Critter, { type CritterName } from "@/art/critters";
import { Badge, Card, Icon, type Tone } from "@/components/ui";
import { projects, type Project } from "@/lib/profile";

const STATUS_TONE: Record<Project["status"], Tone> = {
  Shipped: "emerald",
  "In flight": "amber",
  "Side project": "violet",
};

const PROJECT_CRITTERS: CritterName[] = ["crab", "bee", "turtle", "moth", "penguin"];

export default function Projects() {
  return (
    <div className="flex flex-col gap-10">
      <header className="relative">
        <Critter
          name="crab"
          size={42}
          className="absolute -top-2 right-0 hidden text-accent opacity-100 sm:block"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-content-muted">
          The work I would want to talk through in an interview. One of them you can open and click
          around in right now.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {projects.map((project, i) => (
          <Card
            key={project.title}
            className={`relative flex flex-col gap-4 ${project.href ? "lg:col-span-2" : ""}`}
          >
            <Critter
              name={PROJECT_CRITTERS[i % PROJECT_CRITTERS.length]}
              size={28}
              className="absolute right-4 top-4 text-accent opacity-100"
            />

            <div className="pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-content">{project.title}</h2>
                <Badge tone={STATUS_TONE[project.status]}>{project.status}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-content-subtle">
                {project.role} · {project.period}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-content-muted">{project.description}</p>

            {project.outcome && (
              <p className="border-l-2 border-accent/50 pl-3 text-sm italic leading-relaxed text-content-subtle">
                {project.outcome}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge key={tag} tone="cyan">
                  {tag}
                </Badge>
              ))}
            </div>

            {project.href && (
              <a
                href={project.href}
                className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
              >
                <Icon name="share" size={15} />
                {project.linkLabel}
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
