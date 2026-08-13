import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { createTrip } from "@/api/trips";
import type { TripType } from "@/api/types";
import { TRIP_TYPE_META } from "@/lib/tripTypes";

const TRIP_TYPES = Object.keys(TRIP_TYPE_META) as TripType[];
const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

export default function NewTrip() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<TripType | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!tripType) {
      setError("Pick a trip type.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const trip = await createTrip({
        title,
        trip_type: tripType,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      navigate(`/app/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">New trip</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">Trip type</p>
          <div className="grid grid-cols-5 gap-2">
            {TRIP_TYPES.map((type) => {
              const meta = TRIP_TYPE_META[type];
              const selected = tripType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTripType(type)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs transition-colors ${
                    selected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="text-xl">{meta.icon}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create trip"}
        </button>
      </form>
    </section>
  );
}
