import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTrips } from "@/api/trips";
import type { Trip } from "@/api/types";
import { useAuth } from "@/lib/AuthContext";
import { TRIP_TYPE_META } from "@/lib/tripTypes";

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTrips()
      .then(setTrips)
      .catch(() => setError("Could not load trips."));
  }, []);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your trips</h1>
        <Link
          to="/app/trips/new"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
        >
          New trip
        </Link>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {trips === null && !error && <p className="text-slate-500">Loading…</p>}
      {trips?.length === 0 && (
        <p className="text-slate-500">No trips yet. Start planning your first adventure.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trips?.map((trip) => {
          const meta = TRIP_TYPE_META[trip.trip_type];
          return (
            <Link
              key={trip.id}
              to={`/app/trips/${trip.id}`}
              className="flex flex-col gap-3 rounded-lg border border-slate-800 p-5 transition-colors hover:border-slate-600"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{meta.icon}</span>
                <div className="flex gap-2">
                  {trip.user_id !== user?.id && (
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-400">
                      Shared
                    </span>
                  )}
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-300">
                    {trip.status}
                  </span>
                </div>
              </div>
              <h2 className="text-lg font-semibold">{trip.title}</h2>
              <p className="text-sm text-slate-500">{meta.label}</p>
              <p className="text-sm text-slate-500">
                {trip.start_date ?? "No start date"} — {trip.end_date ?? "No end date"}
              </p>
              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Planned</span>
                  <span>{trip.percent_planned}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${trip.percent_planned}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
