import { useEffect, useState, type FormEvent } from "react";
import { createLocation, deleteLocation, listLocations } from "@/api/trips";
import type { Location, LocationKind } from "@/api/types";

const KIND_OPTIONS: LocationKind[] = ["waypoint", "campsite", "hotel", "poi", "fuel_stop"];

export default function LocationsSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<LocationKind>("waypoint");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listLocations(tripId).then(setLocations);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createLocation(tripId, { name, kind });
      setName("");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteLocation(id);
    refresh();
    onChange?.();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Locations</h2>
      <ul className="flex flex-col gap-2">
        {locations.map((location) => (
          <li
            key={location.id}
            className="flex items-center justify-between rounded-md border border-slate-800 px-4 py-2"
          >
            <span>
              <span className="mr-2 text-xs uppercase tracking-widest text-slate-500">
                {location.kind}
              </span>
              {location.name}
            </span>
            <button
              onClick={() => handleDelete(location.id)}
              className="text-xs text-slate-500 hover:text-red-400"
            >
              Remove
            </button>
          </li>
        ))}
        {locations.length === 0 && <p className="text-sm text-slate-500">No locations yet.</p>}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Location name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as LocationKind)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          {KIND_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  );
}
