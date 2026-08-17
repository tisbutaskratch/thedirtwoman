import Critter from "@/art/critters";
import { Badge, Card } from "@/components/ui";
import { about, earlyRoles, education, profile, spokenLanguages } from "@/lib/profile";

export default function About() {
  return (
    <div className="flex flex-col gap-10">
      <header className="relative">
        <Critter
          name="koala"
          size={44}
          className="absolute -top-2 right-0 hidden text-accent opacity-100 sm:block"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About</h1>
        <p className="mt-2 max-w-2xl text-content-muted">
          {profile.title} · also findable as {profile.alsoKnownAs}
        </p>
      </header>

      {/* One column, generous measure. Long prose in a wide container is the
          fastest way to make someone stop reading. */}
      <div className="flex max-w-2xl flex-col gap-5">
        {about.paragraphs.map((paragraph, i) => (
          <p key={i} className="text-base leading-relaxed text-content-muted">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-content-subtle">
            <Critter name="deer" size={26} className="text-accent opacity-100" />
            Education
          </h2>
          <ul className="flex flex-col gap-3">
            {education.map((d) => (
              <li key={d.degree}>
                <p className="font-medium text-content">{d.degree}</p>
                <p className="text-sm text-content-muted">
                  {d.school} · {d.location} · {d.years}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-content-subtle">
            <Critter name="puffin" size={26} className="text-accent opacity-100" />
            Languages
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {spokenLanguages.map((lang) => (
              <li key={lang.name}>
                <Badge tone="cyan">
                  {lang.name} · {lang.level}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* The years between the degree and the first engineering job, so the
          timeline doesn't have an unexplained hole in it. */}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-content-subtle">
          <Critter name="wiggler" size={26} className="text-accent opacity-100" />
          Before all that
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {earlyRoles.map((role) => (
            <Card key={role.title} className="flex flex-col gap-1">
              <p className="font-medium text-content">{role.title}</p>
              <p className="text-sm text-content-subtle">
                {role.org} · {role.period}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-content-muted">{role.note}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
