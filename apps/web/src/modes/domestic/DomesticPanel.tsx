import { useEffect, useState, type FormEvent } from "react";
import { Badge, Field, IconButton, Section, StatTile, inputClass } from "@/components/ui";
import { getDomesticDetail, updateDomesticDetail } from "@/modes/domestic/api";
import type { DomesticDetail, DomesticTravelMode } from "@/modes/domestic/types";

const MODES: { value: DomesticTravelMode; label: string; glyph: string }[] = [
  { value: "car", label: "Driving", glyph: "🚗" },
  { value: "train", label: "Rail", glyph: "🚆" },
  { value: "flight", label: "Flight", glyph: "🛫" },
];

const LODGING = ["", "Hotel", "Motel", "Airbnb", "Campground", "Friends or family"];

const YES_NO = [
  { label: "Not decided", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

const EMPTY = {
  travel_mode: "",
  booking_ref: "",
  origin: "",
  destination: "",
  is_rental: "",
  rental_company: "",
  total_distance_mi: "",
  vehicle_mpg: "",
  fuel_price_per_gallon: "",
  rail_operator: "",
  rail_pass_type: "",
  seat_reservation_required: "",
  seat_reservations_booked: "",
  airline: "",
  checked_bags: "",
  carry_on_only: "",
  separate_tickets: "",
  layover_notes: "",
  lodging_type: "",
  lodging_ref: "",
};

export default function DomesticPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<DomesticDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  function load() {
    getDomesticDetail(tripId).then((d) => {
      setDetail(d);
      const str = (v: string | number | null) => (v === null ? "" : String(v));
      const bool = (v: boolean | null) => (v === null ? "" : String(v));
      setForm({
        travel_mode: d.travel_mode ?? "",
        booking_ref: str(d.booking_ref),
        origin: str(d.origin),
        destination: str(d.destination),
        is_rental: bool(d.is_rental),
        rental_company: str(d.rental_company),
        total_distance_mi: str(d.total_distance_mi),
        vehicle_mpg: str(d.vehicle_mpg),
        fuel_price_per_gallon: str(d.fuel_price_per_gallon),
        rail_operator: str(d.rail_operator),
        rail_pass_type: str(d.rail_pass_type),
        seat_reservation_required: bool(d.seat_reservation_required),
        seat_reservations_booked: bool(d.seat_reservations_booked),
        airline: str(d.airline),
        checked_bags: str(d.checked_bags),
        carry_on_only: bool(d.carry_on_only),
        separate_tickets: bool(d.separate_tickets),
        layover_notes: str(d.layover_notes),
        lodging_type: str(d.lodging_type),
        lodging_ref: str(d.lodging_ref),
      });
    });
  }

  useEffect(load, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const bool = (v: string) => (v === "" ? null : v === "true");
      const num = (v: string) => (v === "" ? null : Number(v));
      const updated = await updateDomesticDetail(tripId, {
        travel_mode: (form.travel_mode || null) as DomesticTravelMode | null,
        booking_ref: form.booking_ref || null,
        origin: form.origin || null,
        destination: form.destination || null,
        is_rental: bool(form.is_rental),
        rental_company: form.rental_company || null,
        total_distance_mi: num(form.total_distance_mi),
        vehicle_mpg: num(form.vehicle_mpg),
        fuel_price_per_gallon: num(form.fuel_price_per_gallon),
        rail_operator: form.rail_operator || null,
        rail_pass_type: form.rail_pass_type || null,
        seat_reservation_required: bool(form.seat_reservation_required),
        seat_reservations_booked: bool(form.seat_reservations_booked),
        airline: form.airline || null,
        checked_bags: num(form.checked_bags),
        carry_on_only: bool(form.carry_on_only),
        separate_tickets: bool(form.separate_tickets),
        layover_notes: form.layover_notes || null,
        lodging_type: form.lodging_type || null,
        lodging_ref: form.lodging_ref || null,
      });
      setDetail(updated);
      setEditing(false);
      onChange?.();
    } finally {
      setSaving(false);
    }
  }

  if (!detail) return null;

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: e.target.value });

  const mode = editing ? form.travel_mode : (detail.travel_mode ?? "");
  const modeMeta = MODES.find((m) => m.value === mode);

  return (
    <Section
      glyph={modeMeta?.glyph ?? "🧳"}
      title="Getting there"
      tone="fuchsia"
      meta={modeMeta?.label}
      actions={
        !editing && (
          <IconButton onClick={() => setEditing(true)} title="Edit travel plan" icon="edit" />
        )
      }
    >
      {editing ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-card border border-edge bg-surface-overlay p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="How you're travelling">
              <select value={form.travel_mode} onChange={set("travel_mode")} className={inputClass}>
                <option value="">Not decided</option>
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="From">
              <input
                type="text"
                value={form.origin}
                onChange={set("origin")}
                className={inputClass}
              />
            </Field>
            <Field label="To">
              <input
                type="text"
                value={form.destination}
                onChange={set("destination")}
                className={inputClass}
              />
            </Field>
            <Field label="Confirmation #">
              <input
                type="text"
                placeholder="PNR or booking ref"
                value={form.booking_ref}
                onChange={set("booking_ref")}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Only the fields that apply to the chosen mode. */}
          {form.travel_mode === "car" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Rental?">
                <select value={form.is_rental} onChange={set("is_rental")} className={inputClass}>
                  {YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rental company">
                <input
                  type="text"
                  value={form.rental_company}
                  onChange={set("rental_company")}
                  className={inputClass}
                />
              </Field>
              <Field label="Total distance (mi)">
                <input
                  type="number"
                  min={0}
                  value={form.total_distance_mi}
                  onChange={set("total_distance_mi")}
                  className={inputClass}
                />
              </Field>
              <Field label="Vehicle MPG">
                <input
                  type="number"
                  min={0}
                  value={form.vehicle_mpg}
                  onChange={set("vehicle_mpg")}
                  className={inputClass}
                />
              </Field>
              <Field label="Fuel $/gal">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.fuel_price_per_gallon}
                  onChange={set("fuel_price_per_gallon")}
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {form.travel_mode === "train" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Operator">
                <input
                  type="text"
                  placeholder="Amtrak, SNCF…"
                  value={form.rail_operator}
                  onChange={set("rail_operator")}
                  className={inputClass}
                />
              </Field>
              <Field label="Rail pass">
                <input
                  type="text"
                  placeholder="Eurail, JR Pass…"
                  value={form.rail_pass_type}
                  onChange={set("rail_pass_type")}
                  className={inputClass}
                />
              </Field>
              <Field label="Seat reservation needed?">
                <select
                  value={form.seat_reservation_required}
                  onChange={set("seat_reservation_required")}
                  className={inputClass}
                >
                  {YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Reservations booked?">
                <select
                  value={form.seat_reservations_booked}
                  onChange={set("seat_reservations_booked")}
                  className={inputClass}
                >
                  {YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {form.travel_mode === "flight" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Airline">
                <input
                  type="text"
                  value={form.airline}
                  onChange={set("airline")}
                  className={inputClass}
                />
              </Field>
              <Field label="Checked bags">
                <input
                  type="number"
                  min={0}
                  value={form.checked_bags}
                  onChange={set("checked_bags")}
                  className={inputClass}
                />
              </Field>
              <Field label="Carry-on only?">
                <select
                  value={form.carry_on_only}
                  onChange={set("carry_on_only")}
                  className={inputClass}
                >
                  {YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Legs on separate tickets?">
                <select
                  value={form.separate_tickets}
                  onChange={set("separate_tickets")}
                  className={inputClass}
                >
                  {YES_NO.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Layover notes" span>
                <textarea
                  rows={2}
                  placeholder="90 min in DEN — same terminal, bags checked through"
                  value={form.layover_notes}
                  onChange={set("layover_notes")}
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Staying in">
              <select
                value={form.lodging_type}
                onChange={set("lodging_type")}
                className={inputClass}
              >
                {LODGING.map((l) => (
                  <option key={l} value={l}>
                    {l || "Not set"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lodging confirmation #">
              <input
                type="text"
                value={form.lodging_ref}
                onChange={set("lodging_ref")}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-1">
            <IconButton onClick={() => setEditing(false)} title="Cancel" icon="close" />
            <IconButton
              type="submit"
              title="Save"
              variant="confirm"
              disabled={saving}
              icon="confirm"
              size={19}
            />
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Route"
              value={
                detail.origin || detail.destination
                  ? `${detail.origin ?? "?"} → ${detail.destination ?? "?"}`
                  : null
              }
              tone="fuchsia"
            />
            <StatTile label="Confirmation" value={detail.booking_ref} tone="cyan" />

            {detail.travel_mode === "car" && (
              <>
                <StatTile
                  label="Fuel needed"
                  value={detail.est_fuel_gallons}
                  unit="gal"
                  hint="Estimated at 15% below sticker MPG"
                  tone="amber"
                />
                <StatTile
                  label="Fuel cost"
                  value={detail.est_fuel_cost !== null ? `$${detail.est_fuel_cost}` : null}
                  hint={detail.total_distance_mi ? `${detail.total_distance_mi} mi` : "Set distance"}
                  tone="emerald"
                />
              </>
            )}

            {detail.travel_mode === "train" && (
              <>
                <StatTile label="Operator" value={detail.rail_operator} tone="sky" />
                <StatTile
                  label="Seat reservations"
                  value={
                    detail.reservations_outstanding === null
                      ? null
                      : detail.reservations_outstanding
                        ? "Outstanding"
                        : "Sorted"
                  }
                  hint="A pass is not a seat"
                  tone={detail.reservations_outstanding ? "rose" : "emerald"}
                  status={
                    detail.reservations_outstanding === null
                      ? "none"
                      : detail.reservations_outstanding
                        ? "warn"
                        : "ok"
                  }
                />
              </>
            )}

            {detail.travel_mode === "flight" && (
              <>
                <StatTile
                  label="Be at the airport"
                  value={detail.recommended_airport_lead_hours}
                  unit="hrs early"
                  hint="Standard for a domestic departure"
                  tone="sky"
                />
                <StatTile
                  label="Connection risk"
                  value={detail.connection_risk === null ? null : detail.connection_risk}
                  hint={
                    detail.separate_tickets
                      ? "Separate tickets — a missed leg is on you"
                      : "One ticket — the airline owns the connection"
                  }
                  tone={detail.connection_risk === "high" ? "rose" : "emerald"}
                  status={
                    detail.connection_risk === null
                      ? "none"
                      : detail.connection_risk === "high"
                        ? "warn"
                        : "ok"
                  }
                />
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {detail.is_rental && <Badge tone="amber">Rental{detail.rental_company ? ` · ${detail.rental_company}` : ""}</Badge>}
            {detail.rail_pass_type && <Badge tone="violet">{detail.rail_pass_type}</Badge>}
            {detail.airline && <Badge tone="sky">{detail.airline}</Badge>}
            {detail.carry_on_only && <Badge tone="emerald">Carry-on only</Badge>}
            {detail.checked_bags !== null && detail.checked_bags > 0 && (
              <Badge tone="cyan">
                {detail.checked_bags} checked bag{detail.checked_bags === 1 ? "" : "s"}
              </Badge>
            )}
            {detail.lodging_type && (
              <Badge tone="rose">
                {detail.lodging_type}
                {detail.lodging_ref ? ` · ${detail.lodging_ref}` : ""}
              </Badge>
            )}
          </div>

          {detail.layover_notes && (
            <div className="rounded-card border border-edge bg-surface-raised p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                Layover
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-content-muted">
                {detail.layover_notes}
              </p>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
