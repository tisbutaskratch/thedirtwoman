import { projects } from "@/lib/profile";
import { neonAt } from "@/lib/neonPalette";

export default function Projects() {
  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <div className="flex flex-col gap-6">
        {projects.map((project, i) => (
          <article
            key={project.title}
            className={`rounded-lg border border-slate-800 border-l-4 ${neonAt(i).border} p-5`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  project.status === "Completed"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{project.role}</p>
            <p className="mt-3 text-slate-300">{project.description}</p>
            {project.outcome && (
              <p className="mt-3 text-sm text-slate-400">
                <span className="font-medium text-slate-300">Outcome: </span>
                {project.outcome}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
