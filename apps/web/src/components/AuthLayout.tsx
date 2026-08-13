import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export default function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 block text-center text-lg font-bold tracking-tight">
          Adventure Planner
        </Link>
        <div className="rounded-lg border border-slate-800 p-6">
          <h1 className="mb-6 text-xl font-semibold">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
