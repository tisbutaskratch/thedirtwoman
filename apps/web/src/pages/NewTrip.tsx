import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { createTrip } from "@/api/trips";
import type { TripType } from "@/api/types";
import { Field, Icon, TONE_SOFT, inputClass } from "@/components/ui";
import TripMark from "@/art/tripMarks";
import { TRIP_TYPE_META, TRIP_TYPES } from "@/lib/tripTypes";

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
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-accent"
        >
          <Icon name="back" size={14} /> All trips
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Plan a new trip</h1>
        <p className="mt-1 text-sm text-content-muted">
          Pick the kind of trip and we'll tailor the planning tools to it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-content-subtle">
            Trip type
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TRIP_TYPES.map((type) => {
              const meta = TRIP_TYPE_META[type];
              const selected = tripType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTripType(type)}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-2 rounded-card border p-4 text-center transition-all hover:-translate-y-0.5 ${
                    selected
                      ? `${TONE_SOFT[meta.tone]} ring-2 ring-accent`
                      : "border-edge bg-surface-raised text-content-muted hover:border-edge-strong"
                  }`}
                >
                  <TripMark type={type} size={30} />
                  <span className="text-sm font-medium">{meta.label}</span>
                  <span className="text-[11px] leading-snug text-content-subtle">{meta.blurb}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Trip name">
          <input
            type="text"
            required
            placeholder="KAT 2026 — Kentucky Adventure Tour"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create trip"}
        </button>
      </form>
    </section>
  );
}
