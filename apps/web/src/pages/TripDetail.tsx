import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteTrip, getTrip, updateTrip } from "@/api/trips";
import type { Trip, TripStatus } from "@/api/types";
import ActivitiesSection from "@/components/trip/ActivitiesSection";
import ExpensesSection from "@/components/trip/ExpensesSection";
import FilesSection from "@/components/trip/FilesSection";
import GearSection from "@/components/trip/GearSection";
import LocationsSection from "@/components/trip/LocationsSection";
import MembersSection from "@/components/trip/MembersSection";
import NotesSection from "@/components/trip/NotesSection";
import PhotosSection from "@/components/trip/PhotosSection";
import TasksSection from "@/components/trip/TasksSection";
import { Badge, IconButton, TONE_SOFT } from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";
import { TRIP_TYPE_META } from "@/lib/tripTypes";
import BackpackingPanel from "@/modes/backpacking/BackpackingPanel";
import CampingPanel from "@/modes/camping/CampingPanel";
import InternationalPanel from "@/modes/international/InternationalPanel";
import OverlandingPanel from "@/modes/overlanding/OverlandingPanel";

const STATUS_OPTIONS: TripStatus[] = ["planning", "active", "completed"];

const STATUS_TONE: Record<TripStatus, "sky" | "emerald" | "violet"> = {
  planning: "sky",
  active: "emerald",
  completed: "violet",
};

function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return "No dates set";
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  return fmt((start ?? end) as string);
}

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshTrip = useCallback(() => {
    getTrip(id)
      .then(setTrip)
      .catch(() => setError("Could not load this trip."));
  }, [id]);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  async function handleStatusChange(status: TripStatus) {
    const updated = await updateTrip(id, { status });
    setTrip(updated);
  }

  async function handleDelete() {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    await deleteTrip(id);
    navigate("/app/dashboard");
  }

  if (error) return <p className="text-rose-400">{error}</p>;
  if (!trip)
    return <p className="animate-pulse text-content-subtle">Loading trip…</p>;

  const meta = TRIP_TYPE_META[trip.trip_type];
  const isOwner = trip.user_id === user?.id;

  return (
    <div className="flex flex-col gap-6">
      {/* Trip header — sticky so the way back is always one click away. */}
      <header className="sticky top-0 z-20 -mx-4 border-b border-edge bg-surface/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-accent"
        >
          <span aria-hidden>←</span> All trips
        </Link>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-card border text-2xl ${TONE_SOFT[meta.tone]}`}
            >
              {meta.icon}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
                {trip.title}
              </h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-content-muted">
                <span>{meta.label}</span>
                <span aria-hidden className="text-content-subtle">
                  ·
                </span>
                <span>{formatRange(trip.start_date, trip.end_date)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[trip.status]}>
              <span className="capitalize">{trip.status}</span>
            </Badge>
            <select
              value={trip.status}
              onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
              aria-label="Trip status"
              className="rounded-md border border-edge bg-surface-sunken px-2.5 py-1.5 text-sm capitalize text-content outline-none focus:border-accent"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {isOwner && (
              <IconButton onClick={handleDelete} title="Delete trip" variant="danger">
                🗑
              </IconButton>
            )}
          </div>
        </div>
      </header>

      {/* Mode essentials: the one section that differs per trip type. */}
      {trip.trip_type === "backpacking" && (
        <BackpackingPanel tripId={id} onChange={refreshTrip} />
      )}
      {trip.trip_type === "overlanding" && (
        <OverlandingPanel tripId={id} onChange={refreshTrip} />
      )}
      {trip.trip_type === "camping" && <CampingPanel tripId={id} onChange={refreshTrip} />}
      {trip.trip_type === "international" && (
        <InternationalPanel tripId={id} onChange={refreshTrip} />
      )}

      {/*
       * Bento layout: a 12-column grid where each section claims a span that
       * matches how much room its content actually needs, so the page fills
       * the viewport instead of running as one narrow centre column.
       */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <ActivitiesSection tripId={id} onChange={refreshTrip} tripStartDate={trip.start_date} />
        </div>

        <div className="lg:col-span-4">
          <MembersSection tripId={id} isOwner={isOwner} />
        </div>
        <div className="lg:col-span-8">
          <GearSection tripId={id} onChange={refreshTrip} />
        </div>

        <div className="lg:col-span-4">
          <TasksSection tripId={id} onChange={refreshTrip} />
        </div>
        <div className="lg:col-span-4">
          <NotesSection tripId={id} onChange={refreshTrip} />
        </div>
        <div className="lg:col-span-4">
          <FilesSection tripId={id} />
        </div>

        <div className="lg:col-span-7">
          <LocationsSection tripId={id} onChange={refreshTrip} />
        </div>
        <div className="lg:col-span-5">
          <ExpensesSection tripId={id} />
        </div>

        <div className="lg:col-span-12">
          <PhotosSection tripId={id} />
        </div>
      </div>
    </div>
  );
}
