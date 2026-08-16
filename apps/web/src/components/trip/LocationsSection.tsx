import { useEffect, useState, type FormEvent } from "react";
import { createLocation, deleteLocation, listLocations, updateLocation } from "@/api/trips";
import type { Location, LocationKind } from "@/api/types";
import { AddForm, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

const KIND_OPTIONS: LocationKind[] = ["waypoint", "campsite", "hotel", "poi", "fuel_stop"];

const KIND_META: Record<LocationKind, { icon: string; label: string }> = {
  waypoint: { icon: "📌", label: "Waypoint" },
  campsite: { icon: "⛺", label: "Campsite" },
  hotel: { icon: "🏨", label: "Hotel" },
  poi: { icon: "⭐", label: "Point of interest" },
  fuel_stop: { icon: "⛽", label: "Fuel stop" },
};

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
    <Section
      icon={SECTION_META.locations.icon}
      title="Locations"
      tone={SECTION_META.locations.tone}
      count={locations.length}
      actions={
        !showAdd && (
          <IconButton onClick={() => setShowAdd(true)} title="Add location">
            +
          </IconButton>
        )
      }
    >
      {showAdd && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Location name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as LocationKind)}
              className={`${inputClass} w-40`}
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {KIND_META[k].label}
                </option>
              ))}
            </select>
          </div>
        </AddForm>
      )}

      {locations.length === 0 ? (
        <EmptyState icon="📍" message="No locations yet." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {locations.map((location) => (
            <div
              key={location.id}
              className="rounded-card border border-edge bg-surface-raised p-3"
            >
              <div className="flex items-start gap-2.5">
                <span aria-hidden className="text-lg leading-none">
                  {KIND_META[location.kind].icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-content-subtle">
                    {KIND_META[location.kind].label}
                  </p>
                  <h3 className="truncate text-sm font-medium text-content">{location.name}</h3>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconButton onClick={() => startEdit(location)} title="Edit">
                    ✎
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(location.id)}
                    title="Delete"
                    variant="danger"
                  >
                    −
                  </IconButton>
                </div>
              </div>

              {editingId === location.id && draft ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  <input
                    type="text"
                    placeholder="Address"
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    className={`${inputClass} py-1 text-xs`}
                  />
                  <input
                    type="text"
                    placeholder="Contact phone"
                    value={draft.contactPhone}
                    onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
                    className={`${inputClass} py-1 text-xs`}
                  />
                  <input
                    type="text"
                    placeholder="Confirmation #"
                    value={draft.confirmationRef}
                    onChange={(e) => setDraft({ ...draft, confirmationRef: e.target.value })}
                    className={`${inputClass} py-1 text-xs`}
                  />
                  <div className="flex justify-end gap-1">
                    <IconButton onClick={() => saveEdit(location.id)} title="Save" variant="confirm">
                      ✓
                    </IconButton>
                    <IconButton onClick={() => setEditingId(null)} title="Cancel">
                      ×
                    </IconButton>
                  </div>
                </div>
              ) : (
                (location.address || location.contact_phone || location.confirmation_ref) && (
                  <div className="mt-2 flex flex-col gap-0.5 border-t border-edge pt-2 text-xs text-content-subtle">
                    {location.address && <span>📍 {location.address}</span>}
                    {location.contact_phone && (
                      <a
                        href={`tel:${location.contact_phone}`}
                        className="hover:text-accent"
                      >
                        ☎ {location.contact_phone}
                      </a>
                    )}
                    {location.confirmation_ref && <span>🎟 {location.confirmation_ref}</span>}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
