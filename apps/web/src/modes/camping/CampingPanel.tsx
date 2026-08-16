import { useEffect, useState, type FormEvent } from "react";
import { getCampingDetail, updateCampingDetail } from "@/modes/camping/api";
import type { CampingDetail } from "@/modes/camping/types";
import { Badge, Card, Field, IconButton, Section, StatTile, inputClass } from "@/components/ui";

const YES_NO = [
  { label: "Not checked yet", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

const FIREWOOD_POLICIES = ["", "Buy local", "Bring your own", "Provided", "No fires"];

export default function CampingPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<CampingDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    campground_reservation_ref: "",
    check_in_time: "",
    quiet_hours: "",
    fire_restrictions_checked: "",
    potable_water_available: "",
    firewood_policy: "",
    meal_plan: "",
  });

  function load() {
    getCampingDetail(tripId).then((d) => {
      setDetail(d);
      setForm({
        campground_reservation_ref: d.campground_reservation_ref ?? "",
        check_in_time: d.check_in_time ?? "",
        quiet_hours: d.quiet_hours ?? "",
        fire_restrictions_checked:
          d.fire_restrictions_checked === null ? "" : String(d.fire_restrictions_checked),
        potable_water_available:
          d.potable_water_available === null ? "" : String(d.potable_water_available),
        firewood_policy: d.firewood_policy ?? "",
        meal_plan: d.meal_plan ?? "",
      });
    });
  }

  useEffect(load, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const bool = (v: string) => (v === "" ? null : v === "true");
      const updated = await updateCampingDetail(tripId, {
        campground_reservation_ref: form.campground_reservation_ref || null,
        check_in_time: form.check_in_time || null,
        quiet_hours: form.quiet_hours || null,
        fire_restrictions_checked: bool(form.fire_restrictions_checked),
        potable_water_available: bool(form.potable_water_available),
        firewood_policy: form.firewood_policy || null,
        meal_plan: form.meal_plan || null,
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

  const needsHauledWater = detail.potable_water_available === false;

  return (
    <Section
      icon="🏕️"
      title="Campground"
      tone="emerald"
      actions={
        !editing && (
          <IconButton onClick={() => setEditing(true)} title="Edit campground details">
            ✎
          </IconButton>
        )
      }
    >
      {editing ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-card border border-edge bg-surface-overlay p-4"
        >
          <div className="flex justify-end">
            <IconButton onClick={() => setEditing(false)} title="Cancel">
              ×
            </IconButton>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Reservation #">
              <input
                type="text"
                value={form.campground_reservation_ref}
                onChange={set("campground_reservation_ref")}
                className={inputClass}
              />
            </Field>
            <Field label="Check-in time">
              <input
                type="text"
                placeholder="2:00 PM"
                value={form.check_in_time}
                onChange={set("check_in_time")}
                className={inputClass}
              />
            </Field>
            <Field label="Quiet hours">
              <input
                type="text"
                placeholder="10 PM – 6 AM"
                value={form.quiet_hours}
                onChange={set("quiet_hours")}
                className={inputClass}
              />
            </Field>
            <Field label="Potable water on site">
              <select
                value={form.potable_water_available}
                onChange={set("potable_water_available")}
                className={inputClass}
              >
                {YES_NO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fire restrictions">
              <select
                value={form.fire_restrictions_checked}
                onChange={set("fire_restrictions_checked")}
                className={inputClass}
              >
                <option value="">Not checked yet</option>
                <option value="true">Checked — fires allowed</option>
                <option value="false">Checked — restrictions on</option>
              </select>
            </Field>
            <Field label="Firewood">
              <select
                value={form.firewood_policy}
                onChange={set("firewood_policy")}
                className={inputClass}
              >
                {FIREWOOD_POLICIES.map((p) => (
                  <option key={p} value={p}>
                    {p || "Not set"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Meal plan" span>
              <textarea
                rows={3}
                placeholder={"Fri: chili\nSat: foil packets + s'mores\nSun: eggs and coffee"}
                value={form.meal_plan}
                onChange={set("meal_plan")}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <IconButton type="submit" title="Save" variant="confirm" disabled={saving}>
              ✓
            </IconButton>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Nights"
              value={detail.nights ?? "—"}
              hint={detail.nights !== null ? `${detail.nights + 1} days on site` : "Set trip dates"}
              tone="emerald"
            />
            <StatTile label="Party" value={detail.party_size} unit="people" tone="cyan" />
            <StatTile
              label="Water to pack"
              value={needsHauledWater ? (detail.est_water_needed_gal ?? "—") : "0"}
              unit={needsHauledWater ? "gal" : undefined}
              hint={
                detail.potable_water_available === null
                  ? "Check if the site has potable water"
                  : needsHauledWater
                    ? "No potable water on site"
                    : "Potable water available on site"
              }
              tone={needsHauledWater ? "amber" : "cyan"}
              status={detail.potable_water_available === null ? "none" : needsHauledWater ? "warn" : "ok"}
            />
            <StatTile
              label="Reservation"
              value={detail.campground_reservation_ref ?? "—"}
              hint={detail.check_in_time ? `Check in ${detail.check_in_time}` : "No check-in time"}
              tone="violet"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {detail.fire_restrictions_checked !== null && (
              <Badge tone={detail.fire_restrictions_checked ? "emerald" : "rose"}>
                {detail.fire_restrictions_checked ? "🔥 Fires allowed" : "🚫 Fire restrictions on"}
              </Badge>
            )}
            {detail.firewood_policy && <Badge tone="orange">🪵 {detail.firewood_policy}</Badge>}
            {detail.quiet_hours && <Badge tone="sky">🤫 {detail.quiet_hours}</Badge>}
          </div>

          {detail.meal_plan && (
            <Card>
              <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                🍳 Meal plan
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-content-muted">
                {detail.meal_plan
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </Section>
  );
}
