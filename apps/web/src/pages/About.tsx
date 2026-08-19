import Critter from "@/art/critters";
import { Card } from "@/components/ui";
import { about, education, profile } from "@/lib/profile";

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

      <Card className="flex max-w-2xl flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-content-subtle">
          <Critter name="deer" size={26} className="text-accent opacity-100" />
          Education
        </h2>
        <ul className="flex flex-col gap-2.5">
          {education.map((d) => (
            <li key={d.degree}>
              <p className="font-medium text-content">{d.degree}</p>
              <p className="text-sm text-content-muted">{d.school}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
