import { useEffect, useState, type FormEvent } from "react";
import { createLocation, deleteLocation, listLocations, updateLocation } from "@/api/trips";
import type { Location, LocationKind } from "@/api/types";
import { AddForm, Emoji, EmptyHint, EmptyState, Icon, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

const KIND_OPTIONS: LocationKind[] = ["waypoint", "campsite", "hotel", "poi", "fuel_stop"];

const KIND_META: Record<LocationKind, { glyph: string; label: string }> = {
  waypoint: { glyph: "📌", label: "Waypoint" },
  campsite: { glyph: "⛺", label: "Campsite" },
  hotel: { glyph: "🏨", label: "Hotel" },
  poi: { glyph: "⭐", label: "Point of interest" },
  fuel_stop: { glyph: "⛽", label: "Fuel stop" },
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
  // The add form asks for exactly what the edit form shows, so you're never
  // made to save a bare name and immediately reopen it to fill in the rest.
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [confirmationRef, setConfirmationRef] = useState("");
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
      await createLocation(tripId, {
        name,
        kind,
        address: address.trim() || null,
        contact_phone: contactPhone.trim() || null,
        confirmation_ref: confirmationRef.trim() || null,
      });
      setName("");
      setAddress("");
      setContactPhone("");
      setConfirmationRef("");
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
      glyph={SECTION_META.locations.glyph}
      title="Locations"
      tone={SECTION_META.locations.tone}
      count={locations.length}
      actions={
        !showAdd && (
          <IconButton onClick={() => setShowAdd(true)} title="Add location" icon="add" />
        )
      }
    >
      {showAdd && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          {/*
           * Grid tracks, not flex widths: the inputs already carry w-full, so
           * pairing that with flex-1 collapsed the name field to nothing and
           * let the kind dropdown swallow the row.
           */}
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <input
              type="text"
              autoFocus
              placeholder="Location name"
              aria-label="Location name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            <select
              value={kind}
              aria-label="Location kind"
              onChange={(e) => setKind(e.target.value as LocationKind)}
              className={inputClass}
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {KIND_META[k].label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Address"
            aria-label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="tel"
              placeholder="Contact phone"
              aria-label="Contact phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Confirmation #"
              aria-label="Confirmation number"
              value={confirmationRef}
              onChange={(e) => setConfirmationRef(e.target.value)}
              className={inputClass}
            />
          </div>
        </AddForm>
      )}

      {locations.length === 0 ? (
        <EmptyState glyph="📍" message="No locations yet." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {locations.map((location) => (
            <div
              key={location.id}
              className="rounded-card border border-edge bg-surface-raised p-3"
            >
              <div className="flex items-start gap-2.5">
                <Emoji glyph={KIND_META[location.kind].glyph} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-content-subtle">
                    {KIND_META[location.kind].label}
                  </p>
                  <h3 className="truncate text-sm font-medium text-content">{location.name}</h3>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconButton onClick={() => startEdit(location)} title="Edit" icon="edit" />
                  <IconButton
                    onClick={() => handleDelete(location.id)}
                    title="Delete"
                    variant="danger"
                    icon="remove"
                  />
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
                    <IconButton onClick={() => saveEdit(location.id)} title="Save" variant="confirm" icon="confirm" />
                    <IconButton onClick={() => setEditingId(null)} title="Cancel" icon="close" />
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-1 border-t border-edge pt-2 text-xs text-content-subtle">
                  {location.address && (
                    <span className="flex items-start gap-1.5">
                      <Icon name="address" size={13} className="mt-px shrink-0" />
                      {location.address}
                    </span>
                  )}
                  {location.contact_phone && (
                    <a
                      href={`tel:${location.contact_phone}`}
                      className="flex items-center gap-1.5 hover:text-accent"
                    >
                      <Icon name="phone" size={13} className="shrink-0" />
                      {location.contact_phone}
                    </a>
                  )}
                  {location.confirmation_ref && (
                    <span className="flex items-center gap-1.5">
                      <Icon name="confirmation" size={13} className="shrink-0" />
                      {location.confirmation_ref}
                    </span>
                  )}
                  {!location.address && !location.contact_phone && !location.confirmation_ref && (
                    <EmptyHint>No address or contact saved</EmptyHint>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
