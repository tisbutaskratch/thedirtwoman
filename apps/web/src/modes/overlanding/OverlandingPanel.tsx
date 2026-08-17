import { useEffect, useState, type FormEvent } from "react";
import { getOverlandingDetail, updateOverlandingDetail } from "@/modes/overlanding/api";
import type { OverlandingDetail } from "@/modes/overlanding/types";
import { Badge, Card, Field, IconButton, Section, StatTile, inputClass } from "@/components/ui";

const YES_NO = [
  { label: "Not sure yet", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

const DRIVETRAINS = ["", "4WD", "AWD", "2WD"];

export default function OverlandingPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<OverlandingDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vehicle_name: "",
    fuel_capacity_gal: "",
    aux_fuel_gal: "",
    fuel_economy_mpg: "",
    water_capacity_gal: "",
    tire_pressure_highway_psi: "",
    tire_pressure_offroad_psi: "",
    ground_clearance_in: "",
    drivetrain: "",
    has_recovery_gear: "",
    comms_plan: "",
    emergency_contact: "",
  });

  function load() {
    getOverlandingDetail(tripId).then((d) => {
      setDetail(d);
      setForm({
        vehicle_name: d.vehicle_name ?? "",
        fuel_capacity_gal: d.fuel_capacity_gal?.toString() ?? "",
        aux_fuel_gal: d.aux_fuel_gal?.toString() ?? "",
        fuel_economy_mpg: d.fuel_economy_mpg?.toString() ?? "",
        water_capacity_gal: d.water_capacity_gal?.toString() ?? "",
        tire_pressure_highway_psi: d.tire_pressure_highway_psi?.toString() ?? "",
        tire_pressure_offroad_psi: d.tire_pressure_offroad_psi?.toString() ?? "",
        ground_clearance_in: d.ground_clearance_in?.toString() ?? "",
        drivetrain: d.drivetrain ?? "",
        has_recovery_gear: d.has_recovery_gear === null ? "" : String(d.has_recovery_gear),
        comms_plan: d.comms_plan ?? "",
        emergency_contact: d.emergency_contact ?? "",
      });
    });
  }

  useEffect(load, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const num = (v: string) => (v === "" ? null : Number(v));
      const updated = await updateOverlandingDetail(tripId, {
        vehicle_name: form.vehicle_name || null,
        fuel_capacity_gal: num(form.fuel_capacity_gal),
        aux_fuel_gal: num(form.aux_fuel_gal),
        fuel_economy_mpg: num(form.fuel_economy_mpg),
        water_capacity_gal: num(form.water_capacity_gal),
        tire_pressure_highway_psi: num(form.tire_pressure_highway_psi),
        tire_pressure_offroad_psi: num(form.tire_pressure_offroad_psi),
        ground_clearance_in: num(form.ground_clearance_in),
        drivetrain: form.drivetrain || null,
        has_recovery_gear: form.has_recovery_gear === "" ? null : form.has_recovery_gear === "true",
        comms_plan: form.comms_plan || null,
        emergency_contact: form.emergency_contact || null,
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

  const tirePressures =
    detail.tire_pressure_offroad_psi && detail.tire_pressure_highway_psi
      ? `${detail.tire_pressure_offroad_psi} → ${detail.tire_pressure_highway_psi}`
      : (detail.tire_pressure_offroad_psi ?? detail.tire_pressure_highway_psi ?? null);

  return (
    <Section
      glyph="🚙"
      title="Rig & range"
      tone="amber"
      actions={
        !editing && (
          <IconButton onClick={() => setEditing(true)} title="Edit rig details" icon="edit" />
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
            <Field label="Vehicle">
              <input
                type="text"
                placeholder="4Runner"
                value={form.vehicle_name}
                onChange={set("vehicle_name")}
                className={inputClass}
              />
            </Field>
            <Field label="Drivetrain">
              <select value={form.drivetrain} onChange={set("drivetrain")} className={inputClass}>
                {DRIVETRAINS.map((d) => (
                  <option key={d} value={d}>
                    {d || "Not set"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ground clearance (in)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.ground_clearance_in}
                onChange={set("ground_clearance_in")}
                className={inputClass}
              />
            </Field>
            <Field label="Main tank (gal)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.fuel_capacity_gal}
                onChange={set("fuel_capacity_gal")}
                className={inputClass}
              />
            </Field>
            <Field label="Jerry cans (gal)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.aux_fuel_gal}
                onChange={set("aux_fuel_gal")}
                className={inputClass}
              />
            </Field>
            <Field label="Economy (mpg)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.fuel_economy_mpg}
                onChange={set("fuel_economy_mpg")}
                className={inputClass}
              />
            </Field>
            <Field label="Water onboard (gal)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.water_capacity_gal}
                onChange={set("water_capacity_gal")}
                className={inputClass}
              />
            </Field>
            <Field label="Aired-down PSI">
              <input
                type="number"
                min={0}
                step="0.5"
                placeholder="18"
                value={form.tire_pressure_offroad_psi}
                onChange={set("tire_pressure_offroad_psi")}
                className={inputClass}
              />
            </Field>
            <Field label="Highway PSI">
              <input
                type="number"
                min={0}
                step="0.5"
                placeholder="35"
                value={form.tire_pressure_highway_psi}
                onChange={set("tire_pressure_highway_psi")}
                className={inputClass}
              />
            </Field>
            <Field label="Recovery gear aboard">
              <select
                value={form.has_recovery_gear}
                onChange={set("has_recovery_gear")}
                className={inputClass}
              >
                {YES_NO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Emergency contact">
              <input
                type="text"
                value={form.emergency_contact}
                onChange={set("emergency_contact")}
                className={inputClass}
              />
            </Field>
            <Field label="Comms plan" span>
              <textarea
                rows={2}
                placeholder="GMRS ch. 16 for convoy, inReach check-in nightly…"
                value={form.comms_plan}
                onChange={set("comms_plan")}
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
              label="Range on main"
              value={detail.est_range_miles ?? null}
              unit={detail.est_range_miles ? "mi" : undefined}
              hint={
                detail.fuel_capacity_gal && detail.fuel_economy_mpg
                  ? `${detail.fuel_capacity_gal} gal @ ${detail.fuel_economy_mpg} mpg`
                  : "Set tank + economy"
              }
              tone="amber"
            />
            <StatTile
              label="With jerry cans"
              value={detail.est_total_range_miles ?? null}
              unit={detail.est_total_range_miles ? "mi" : undefined}
              hint={detail.aux_fuel_gal ? `+${detail.aux_fuel_gal} gal aux` : "No aux fuel logged"}
              tone="orange"
            />
            <StatTile
              label="Water supply"
              value={detail.water_days_supported ?? null}
              unit={detail.water_days_supported ? "days" : undefined}
              hint={
                detail.water_capacity_gal
                  ? `${detail.water_capacity_gal} gal onboard`
                  : "Set water capacity"
              }
              tone="cyan"
            />
            <StatTile
              label="Tire PSI"
              value={tirePressures}
              hint="Aired down → highway"
              tone="sky"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {detail.vehicle_name && <Badge tone="amber">🚙 {detail.vehicle_name}</Badge>}
            {detail.drivetrain && <Badge tone="sky">{detail.drivetrain}</Badge>}
            {detail.ground_clearance_in && (
              <Badge tone="sky">{detail.ground_clearance_in}" clearance</Badge>
            )}
            {detail.has_recovery_gear !== null && (
              <Badge tone={detail.has_recovery_gear ? "emerald" : "rose"}>
                {detail.has_recovery_gear ? "🛟 Recovery gear aboard" : "🛟 No recovery gear"}
              </Badge>
            )}
          </div>

          {(detail.comms_plan || detail.emergency_contact) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {detail.comms_plan && (
                <Card>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                    📡 Comms plan
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{detail.comms_plan}</p>
                </Card>
              )}
              {detail.emergency_contact && (
                <Card>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                    🆘 Emergency contact
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{detail.emergency_contact}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
