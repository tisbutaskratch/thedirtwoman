import { useEffect, useState, type FormEvent } from "react";
import { getInternationalDetail, updateInternationalDetail } from "@/modes/international/api";
import type { InternationalDetail } from "@/modes/international/types";
import { Badge, Card, Field, IconButton, Section, StatTile, inputClass } from "@/components/ui";

const YES_NO = [
  { label: "Not sure yet", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

export default function InternationalPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<InternationalDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    passport_expiry: "",
    visa_required: "",
    visa_notes: "",
    vaccinations_notes: "",
    travel_insurance_ref: "",
    embassy_contact: "",
    step_enrolled: "",
    home_currency: "",
    destination_currencies: "",
    primary_timezone: "",
  });

  function load() {
    getInternationalDetail(tripId).then((d) => {
      setDetail(d);
      setForm({
        passport_expiry: d.passport_expiry ?? "",
        visa_required: d.visa_required === null ? "" : String(d.visa_required),
        visa_notes: d.visa_notes ?? "",
        vaccinations_notes: d.vaccinations_notes ?? "",
        travel_insurance_ref: d.travel_insurance_ref ?? "",
        embassy_contact: d.embassy_contact ?? "",
        step_enrolled: d.step_enrolled === null ? "" : String(d.step_enrolled),
        home_currency: d.home_currency ?? "",
        destination_currencies: (d.destination_currencies ?? []).join(", "),
        primary_timezone: d.primary_timezone ?? "",
      });
    });
  }

  useEffect(load, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const bool = (v: string) => (v === "" ? null : v === "true");
      const currencies = form.destination_currencies
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      const updated = await updateInternationalDetail(tripId, {
        passport_expiry: form.passport_expiry || null,
        visa_required: bool(form.visa_required),
        visa_notes: form.visa_notes || null,
        vaccinations_notes: form.vaccinations_notes || null,
        travel_insurance_ref: form.travel_insurance_ref || null,
        embassy_contact: form.embassy_contact || null,
        step_enrolled: bool(form.step_enrolled),
        home_currency: form.home_currency ? form.home_currency.toUpperCase() : null,
        destination_currencies: currencies.length > 0 ? currencies : null,
        primary_timezone: form.primary_timezone || null,
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

  const margin = detail.passport_days_of_margin;

  return (
    <Section
      glyph="✈️"
      title="Documents & logistics"
      tone="fuchsia"
      actions={
        !editing && (
          <IconButton onClick={() => setEditing(true)} title="Edit travel documents" icon="edit" />
        )
      }
    >
      {editing ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-card border border-edge bg-surface-overlay p-4"
        >
          <div className="flex justify-end">
            <IconButton onClick={() => setEditing(false)} title="Cancel" icon="close" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Passport expiry">
              <input
                type="date"
                value={form.passport_expiry}
                onChange={set("passport_expiry")}
                className={inputClass}
              />
            </Field>
            <Field label="Visa required">
              <select
                value={form.visa_required}
                onChange={set("visa_required")}
                className={inputClass}
              >
                {YES_NO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Enrolled in STEP">
              <select
                value={form.step_enrolled}
                onChange={set("step_enrolled")}
                className={inputClass}
              >
                {YES_NO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Home currency">
              <input
                type="text"
                maxLength={3}
                placeholder="USD"
                value={form.home_currency}
                onChange={set("home_currency")}
                className={inputClass}
              />
            </Field>
            <Field label="Destination currencies">
              <input
                type="text"
                placeholder="CLP, ARS"
                value={form.destination_currencies}
                onChange={set("destination_currencies")}
                className={inputClass}
              />
            </Field>
            <Field label="Primary timezone">
              <input
                type="text"
                placeholder="America/Santiago"
                value={form.primary_timezone}
                onChange={set("primary_timezone")}
                className={inputClass}
              />
            </Field>
            <Field label="Insurance policy #">
              <input
                type="text"
                value={form.travel_insurance_ref}
                onChange={set("travel_insurance_ref")}
                className={inputClass}
              />
            </Field>
            <Field label="Embassy contact">
              <input
                type="text"
                placeholder="+56 2 2330 3000"
                value={form.embassy_contact}
                onChange={set("embassy_contact")}
                className={inputClass}
              />
            </Field>
            <Field label="Visa notes">
              <input
                type="text"
                placeholder="e-visa, 30 days"
                value={form.visa_notes}
                onChange={set("visa_notes")}
                className={inputClass}
              />
            </Field>
            <Field label="Vaccinations / health" span>
              <textarea
                rows={2}
                placeholder="Yellow fever cert required; hep A booster…"
                value={form.vaccinations_notes}
                onChange={set("vaccinations_notes")}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <IconButton type="submit" title="Save" variant="confirm" disabled={saving} icon="confirm" />
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Docs ready"
              value={`${detail.docs_ready_count}/${detail.docs_total_count}`}
              hint="Passport, visa, shots, insurance, embassy, STEP"
              tone={detail.docs_ready_count === detail.docs_total_count ? "emerald" : "amber"}
              status={detail.docs_ready_count === detail.docs_total_count ? "ok" : "none"}
            />
            <StatTile
              label="Passport margin"
              value={margin}
              unit={margin !== null ? "days" : undefined}
              hint={
                detail.passport_valid_for_trip === null
                  ? "Add expiry + trip end date"
                  : detail.passport_valid_for_trip
                    ? "Clears the 6-month rule"
                    : "Under the 6-month rule"
              }
              tone={detail.passport_valid_for_trip === false ? "rose" : "emerald"}
              status={
                detail.passport_valid_for_trip === null
                  ? "none"
                  : detail.passport_valid_for_trip
                    ? "ok"
                    : "warn"
              }
            />
            <StatTile
              label="Currency"
              value={
                detail.destination_currencies?.length
                  ? detail.destination_currencies.join(" · ")
                  : null
              }
              hint={detail.home_currency ? `from ${detail.home_currency}` : "Set home currency"}
              tone="violet"
            />
            <StatTile
              label="Timezone"
              value={detail.primary_timezone?.split("/").pop()?.replace("_", " ") ?? null}
              hint={detail.primary_timezone ?? "Not set"}
              tone="sky"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {detail.visa_required !== null && (
              <Badge tone={detail.visa_required ? "amber" : "emerald"}>
                {detail.visa_required ? "📋 Visa required" : "📋 No visa needed"}
              </Badge>
            )}
            {detail.step_enrolled !== null && (
              <Badge tone={detail.step_enrolled ? "emerald" : "rose"}>
                {detail.step_enrolled ? "🛡️ Enrolled in STEP" : "🛡️ Not enrolled in STEP"}
              </Badge>
            )}
            {detail.travel_insurance_ref && (
              <Badge tone="cyan">🏥 Insured · {detail.travel_insurance_ref}</Badge>
            )}
            {detail.passport_valid_for_trip === false && (
              <Badge tone="rose">⚠️ Passport may not meet entry rules</Badge>
            )}
          </div>

          {(detail.visa_notes || detail.vaccinations_notes || detail.embassy_contact) && (
            <div className="grid gap-3 sm:grid-cols-3">
              {detail.visa_notes && (
                <Card>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                    Visa
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{detail.visa_notes}</p>
                </Card>
              )}
              {detail.vaccinations_notes && (
                <Card>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                    💉 Health
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{detail.vaccinations_notes}</p>
                </Card>
              )}
              {detail.embassy_contact && (
                <Card>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                    🏛️ Embassy
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{detail.embassy_contact}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
