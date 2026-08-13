import { skills } from "@/lib/profile";

export default function Skills() {
  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {skills.map((group) => (
          <div key={group.category} className="rounded-lg border border-slate-800 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              {group.category}
            </h2>
            <ul className="flex flex-col gap-2 text-slate-300">
              {group.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
