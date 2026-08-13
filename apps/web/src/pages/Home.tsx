import { Link } from "react-router-dom";
import { profile } from "@/lib/profile";

export default function Home() {
  return (
    <section className="flex flex-col gap-6">
      <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
        {profile.location}
      </p>
      <h1 className="text-5xl font-bold tracking-tight">{profile.name}</h1>
      <p className="text-xl text-slate-300">{profile.title}</p>
      <p className="max-w-xl text-slate-400">{profile.tagline}</p>

      <div className="flex gap-3 pt-4">
        <Link
          to="/projects"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
        >
          See my work
        </Link>
        <Link
          to="/contact"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-500"
        >
          Get in touch
        </Link>
      </div>
    </section>
  );
}
