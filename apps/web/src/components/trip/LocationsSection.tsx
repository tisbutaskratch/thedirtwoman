import { useEffect, useState, type FormEvent } from "react";
import { createLocation, deleteLocation, listLocations, updateLocation } from "@/api/trips";
import type { Location, LocationKind } from "@/api/types";

const KIND_OPTIONS: LocationKind[] = ["waypoint", "campsite", "hotel", "poi", "fuel_stop"];

interface Draft {
  address: string;
  contactPhone: string;
  confirmationRef: string;
}

export default function LocationsSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<LocationKind>("waypoint");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

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

  function startEdit(location: Location) {
    setEditingId(location.id);
    setDraft({
      address: location.address ?? "",
      contactPhone: location.contact_phone ?? "",
      confirmationRef: location.confirmation_ref ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit(id: number) {
    if (!draft) return;
    await updateLocation(id, {
      address: draft.address.trim() || null,
      contact_phone: draft.contactPhone.trim() || null,
      confirmation_ref: draft.confirmationRef.trim() || null,
    });
    setEditingId(null);
    setDraft(null);
    refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Locations</h2>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            title="Add location"
            className="text-slate-500 hover:text-emerald-300"
          >
            +
          </button>
        )}
      </div>

      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-3"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              title="Close"
              className="text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
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
              title="Add"
              className="text-xl text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              ✓
            </button>
          </div>
        </form>
      )}

      {locations.length === 0 && <p className="text-sm text-slate-500">No locations yet.</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <div key={location.id} className="rounded-lg border border-slate-800 p-4">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-500">
                  {location.kind}
                </span>
                <h3 className="font-medium text-slate-100">{location.name}</h3>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(location)}
                  title="Edit"
                  className="text-slate-500 hover:text-emerald-300"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  title="Delete"
                  className="text-slate-600 hover:text-red-400"
                >
                  −
                </button>
              </div>
            </div>

            {editingId === location.id && draft ? (
              <div className="mt-2 flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Address"
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Contact phone"
                  value={draft.contactPhone}
                  onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Confirmation #"
                  value={draft.confirmationRef}
                  onChange={(e) => setDraft({ ...draft, confirmationRef: e.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => saveEdit(location.id)}
                    title="Save"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEdit}
                    title="Cancel"
                    className="text-slate-500 hover:text-slate-300"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex flex-col gap-0.5 text-xs text-slate-500">
                {location.address && <span>📍 {location.address}</span>}
                {location.contact_phone && <span>☎ {location.contact_phone}</span>}
                {location.confirmation_ref && <span>Conf# {location.confirmation_ref}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
