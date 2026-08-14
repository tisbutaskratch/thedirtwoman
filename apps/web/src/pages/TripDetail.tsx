import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteTrip, getTrip, updateTrip } from "@/api/trips";
import type { Trip, TripStatus } from "@/api/types";
import ActivitiesSection from "@/components/trip/ActivitiesSection";
import ExpensesSection from "@/components/trip/ExpensesSection";
import GearSection from "@/components/trip/GearSection";
import LocationsSection from "@/components/trip/LocationsSection";
import NotesSection from "@/components/trip/NotesSection";
import ShareSection from "@/components/trip/ShareSection";
import { useAuth } from "@/lib/AuthContext";
import { TRIP_TYPE_META } from "@/lib/tripTypes";
import BackpackingPanel from "@/modes/backpacking/BackpackingPanel";
import MotocampingPanel from "@/modes/motocamping/MotocampingPanel";
import type { MotocampingDetail } from "@/modes/motocamping/types";
import OverlandingPanel from "@/modes/overlanding/OverlandingPanel";

const STATUS_OPTIONS: TripStatus[] = ["planning", "active", "completed"];

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [motoDetail, setMotoDetail] = useState<MotocampingDetail | null>(null);

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

  if (error) return <p className="text-red-400">{error}</p>;
  if (!trip) return <p className="text-slate-500">Loading…</p>;

  const meta = TRIP_TYPE_META[trip.trip_type];
  const isOwner = trip.user_id === user?.id;

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {meta.icon} {meta.label}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{trip.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {trip.start_date ?? "No start date"} — {trip.end_date ?? "No end date"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={trip.status}
            onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm capitalize text-slate-100"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 transition-colors hover:border-red-700"
            >
              Delete trip
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Planned</span>
          <span>{trip.percent_planned}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-emerald-500" style={{ width: `${trip.percent_planned}%` }} />
        </div>
      </div>

      {trip.trip_type === "motocamping" && (
        <MotocampingPanel tripId={id} onChange={refreshTrip} onDetailChange={setMotoDetail} />
      )}
      {trip.trip_type === "backpacking" && (
        <BackpackingPanel tripId={id} onChange={refreshTrip} />
      )}
      {trip.trip_type === "overlanding" && (
        <OverlandingPanel tripId={id} onChange={refreshTrip} />
      )}

      <ShareSection tripId={id} isOwner={isOwner} />

      <LocationsSection tripId={id} onChange={refreshTrip} />
      <ActivitiesSection
        tripId={id}
        onChange={refreshTrip}
        groupByDay={trip.trip_type === "backpacking" || trip.trip_type === "overlanding"}
        dailyTargetMiles={motoDetail?.daily_ride_target_miles}
      />
      <NotesSection tripId={id} onChange={refreshTrip} />
      <ExpensesSection tripId={id} />
      <GearSection tripId={id} onChange={refreshTrip} />
    </section>
  );
}
