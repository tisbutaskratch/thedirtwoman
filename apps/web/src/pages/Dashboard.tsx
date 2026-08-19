import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listTrips } from "@/api/trips";
import type { Trip } from "@/api/types";
import { Badge, EmptyState, Icon, TONE_EDGE, TONE_SOFT } from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";
import TripMark from "@/art/tripMarks";
import { TRIP_TYPE_META } from "@/lib/tripTypes";
import { routes } from "@/lib/site";

function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return "No dates yet";
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  if (start && end) {
    const year = new Date(`${end}T00:00:00Z`).getUTCFullYear();
    return `${fmt(start)} – ${fmt(end)}, ${year}`;
  }
  return fmt((start ?? end) as string);
}

/** Days until departure, or null once the trip has started/passed. */
function countdown(start: string | null): number | null {
  if (!start) return null;
  const today = new Date();
  const startDate = new Date(`${start}T00:00:00Z`);
  const days = Math.ceil(
    (startDate.getTime() - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86_400_000,
  );
  return days > 0 ? days : null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTrips()
      .then(setTrips)
      .catch(() => setError("Could not load trips."));
  }, []);

  // Upcoming trips first (soonest departure), then undated, then past.
  // Archived trips are filed separately rather than mixed into the list.
  const { current, archived } = useMemo(() => {
    if (!trips) return { current: null, archived: null };
    const byDate = [...trips].sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return a.start_date.localeCompare(b.start_date);
    });
    return {
      current: byDate.filter((t) => t.archived_at === null),
      archived: byDate.filter((t) => t.archived_at !== null),
    };
  }, [trips]);

  const nextUp = current?.find((t) => countdown(t.start_date) !== null);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.name ? `Hey, ${user.name.split(" ")[0]}` : "Your trips"}
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            {nextUp
              ? `${countdown(nextUp.start_date)} days until ${nextUp.title}`
              : "Nothing on the calendar. Time to plan something."}
          </p>
        </div>
        <Link
          to={routes.newTrip}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          + New trip
        </Link>
      </div>

      {error && <p className="text-rose-400">{error}</p>}
      {trips === null && !error && (
        // Skeleton cards say nothing to a screen reader, so the placeholder
        // announces itself instead of leaving the page silently empty.
        <div
          role="status"
          aria-label="Loading trips"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              aria-hidden
              className="h-40 animate-pulse rounded-card border border-edge bg-surface-raised"
            />
          ))}
        </div>
      )}
      {trips?.length === 0 && (
        <EmptyState glyph="🧭" message="No trips yet. Start planning your first adventure." />
      )}

      {current && current.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {current.map((trip) => (
            <TripCard key={trip.id} trip={trip} shared={trip.user_id !== user?.id} />
          ))}
        </div>
      )}

      {archived && archived.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 border-t border-edge pt-6 text-sm font-medium uppercase tracking-wider text-content-subtle">
            <Icon name="archive" size={14} /> Archived
            <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-xs normal-case tracking-normal">
              {archived.length}
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                shared={trip.user_id !== user?.id}
                dimmed
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function TripCard({ trip, shared, dimmed }: { trip: Trip; shared: boolean; dimmed?: boolean }) {
  const meta = TRIP_TYPE_META[trip.trip_type];
  const days = countdown(trip.start_date);
  return (
    <Link
      to={`/app/trips/${trip.id}`}
      // Hand the type across so the trip page can play the right opener
      // before its own fetch resolves.
      state={{ tripType: trip.trip_type }}
      className={`group flex flex-col gap-3 rounded-card border border-edge border-l-4 bg-surface-raised p-4 transition-all hover:-translate-y-0.5 hover:border-edge-strong hover:shadow-lg ${TONE_EDGE[meta.tone]} ${dimmed ? "opacity-70 hover:opacity-100" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-card border ${TONE_SOFT[meta.tone]}`}
        >
          <TripMark type={trip.trip_type} size={24} />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {shared && <Badge tone="cyan">Shared</Badge>}
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
      </div>

      <div>
        <h3 className="font-semibold leading-snug text-content transition-colors group-hover:text-accent">
          {trip.title}
        </h3>
        <p className="mt-0.5 text-xs text-content-subtle">{meta.blurb}</p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-edge pt-2.5 text-xs">
        <span className="text-content-muted">{formatRange(trip.start_date, trip.end_date)}</span>
        {days !== null && <span className="font-medium tabular-nums text-accent">in {days}d</span>}
      </div>
    </Link>
  );
}
