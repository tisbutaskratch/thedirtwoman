import { skills } from "@/lib/profile";
import { neonAt } from "@/lib/neonPalette";

export default function Skills() {
  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {skills.map((group, i) => {
          const colors = neonAt(i);
          return (
            <div
              key={group.category}
              className={`rounded-lg border border-edge border-l-4 ${colors.border} p-5`}
            >
              <h2 className={`mb-3 text-sm font-semibold uppercase tracking-widest ${colors.text}`}>
                {group.category}
              </h2>
              <ul className="flex flex-col gap-2 text-content-muted">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
