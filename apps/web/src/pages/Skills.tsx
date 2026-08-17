import Critter from "@/art/critters";
import { Badge, Card, Emoji } from "@/components/ui";
import { skills } from "@/lib/profile";

export default function Skills() {
  return (
    <div className="flex flex-col gap-10">
      <header className="relative">
        <Critter
          name="bee"
          size={42}
          className="absolute -top-2 right-0 hidden text-accent opacity-100 sm:block"
        />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Skills</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-content-muted">
          Things I have shipped production code with, not things I have read about. Grouped by what
          they are for rather than by how impressive the list looks.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => (
          <Card key={group.category} className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-content-subtle">
              <Emoji glyph={group.glyph} size="md" />
              {group.category}
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li key={item}>
                  <Badge tone="cyan">{item}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
