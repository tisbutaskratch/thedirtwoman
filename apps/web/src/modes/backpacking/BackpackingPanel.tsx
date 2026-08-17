import { useEffect, useState, type FormEvent } from "react";
import { getBackpackingDetail, updateBackpackingDetail } from "@/modes/backpacking/api";
import type { BackpackingDetail } from "@/modes/backpacking/types";
import { Badge, Card, Field, IconButton, Section, StatTile, inputClass } from "@/components/ui";

const YES_NO = [
  { label: "Not sure yet", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

function oz(value: number | null) {
  if (value === null) return null;
  const lbs = Math.floor(value / 16);
  const rest = Math.round(value % 16);
  return lbs > 0 ? `${lbs}lb ${rest}oz` : `${rest}oz`;
}

export default function BackpackingPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<BackpackingDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    base_pack_weight_oz: "",
    total_distance_mi: "",
    elevation_gain_ft: "",
    water_capacity_liters: "",
    longest_dry_stretch_mi: "",
    permit_required: "",
    bear_canister_required: "",
    permit_notes: "",
    resupply_plan: "",
  });

  function load() {
    getBackpackingDetail(tripId).then((d) => {
      setDetail(d);
      setForm({
        base_pack_weight_oz: d.base_pack_weight_oz?.toString() ?? "",
        total_distance_mi: d.total_distance_mi?.toString() ?? "",
        elevation_gain_ft: d.elevation_gain_ft?.toString() ?? "",
        water_capacity_liters: d.water_capacity_liters?.toString() ?? "",
        longest_dry_stretch_mi: d.longest_dry_stretch_mi?.toString() ?? "",
        permit_required: d.permit_required === null ? "" : String(d.permit_required),
        bear_canister_required:
          d.bear_canister_required === null ? "" : String(d.bear_canister_required),
        permit_notes: d.permit_notes ?? "",
        resupply_plan: d.resupply_plan ?? "",
      });
    });
  }

  useEffect(load, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const num = (v: string) => (v === "" ? null : Number(v));
      const bool = (v: string) => (v === "" ? null : v === "true");
      const updated = await updateBackpackingDetail(tripId, {
        base_pack_weight_oz: num(form.base_pack_weight_oz),
        total_distance_mi: num(form.total_distance_mi),
        elevation_gain_ft: num(form.elevation_gain_ft),
        water_capacity_liters: num(form.water_capacity_liters),
        longest_dry_stretch_mi: num(form.longest_dry_stretch_mi),
        permit_required: bool(form.permit_required),
        bear_canister_required: bool(form.bear_canister_required),
        permit_notes: form.permit_notes || null,
        resupply_plan: form.resupply_plan || null,
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

  return (
    <Section
      glyph="🥾"
      title="Trail plan"
      tone="violet"
      actions={
        !editing && (
          <IconButton onClick={() => setEditing(true)} title="Edit trail plan" icon="edit" />
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
            <Field label="Total distance (mi)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.total_distance_mi}
                onChange={set("total_distance_mi")}
                className={inputClass}
              />
            </Field>
            <Field label="Elevation gain (ft)">
              <input
                type="number"
                min={0}
                value={form.elevation_gain_ft}
                onChange={set("elevation_gain_ft")}
                className={inputClass}
              />
            </Field>
            <Field label="Base pack weight (oz)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.base_pack_weight_oz}
                onChange={set("base_pack_weight_oz")}
                className={inputClass}
              />
            </Field>
            <Field label="Water capacity (L)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.water_capacity_liters}
                onChange={set("water_capacity_liters")}
                className={inputClass}
              />
            </Field>
            <Field label="Longest dry stretch (mi)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.longest_dry_stretch_mi}
                onChange={set("longest_dry_stretch_mi")}
                className={inputClass}
              />
            </Field>
            <Field label="Bear canister required">
              <select
                value={form.bear_canister_required}
                onChange={set("bear_canister_required")}
                className={inputClass}
              >
                {YES_NO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Permit required">
              <select
                value={form.permit_required}
                onChange={set("permit_required")}
                className={inputClass}
              >
                {YES_NO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Permit notes" span>
              <input
                type="text"
                placeholder="Where to apply, lottery dates…"
                value={form.permit_notes}
                onChange={set("permit_notes")}
                className={inputClass}
              />
            </Field>
            <Field label="Resupply plan" span>
              <textarea
                rows={2}
                placeholder="Towns, mail drops, how many days between…"
                value={form.resupply_plan}
                onChange={set("resupply_plan")}
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
              label="Distance"
              value={detail.total_distance_mi ?? null}
              unit={detail.total_distance_mi ? "mi" : undefined}
              hint={detail.avg_miles_per_day ? `${detail.avg_miles_per_day} mi/day avg` : undefined}
              tone="violet"
            />
            <StatTile
              label="Elevation gain"
              value={detail.elevation_gain_ft?.toLocaleString() ?? null}
              unit={detail.elevation_gain_ft ? "ft" : undefined}
              tone="violet"
            />
            <StatTile
              label="Pack weight"
              value={oz(detail.est_pack_weight_oz) ?? null}
              hint={
                detail.est_pack_weight_oz !== null
                  ? `base ${oz(detail.base_pack_weight_oz)} + gear ${oz(detail.gear_weight_oz)}`
                  : "Set a base weight"
              }
              tone="violet"
            />
            <StatTile
              label="Water carry"
              value={detail.water_capacity_liters ?? null}
              unit={detail.water_capacity_liters ? "L" : undefined}
              hint={
                detail.water_needed_dry_stretch_l !== null
                  ? `${detail.water_needed_dry_stretch_l}L needed for the dry stretch`
                  : "Set the longest dry stretch"
              }
              tone={detail.water_carry_sufficient === false ? "amber" : "cyan"}
              status={
                detail.water_carry_sufficient === null
                  ? "none"
                  : detail.water_carry_sufficient
                    ? "ok"
                    : "warn"
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {detail.permit_required !== null && (
              <Badge tone={detail.permit_required ? "amber" : "emerald"}>
                {detail.permit_required ? "🎫 Permit required" : "🎫 No permit needed"}
              </Badge>
            )}
            {detail.bear_canister_required !== null && (
              <Badge tone={detail.bear_canister_required ? "amber" : "emerald"}>
                {detail.bear_canister_required ? "🐻 Bear canister required" : "🐻 No canister"}
              </Badge>
            )}
            {detail.water_carry_sufficient === false && (
              <Badge tone="rose">💧 Carry capacity below dry-stretch need</Badge>
            )}
          </div>

          {(detail.permit_notes || detail.resupply_plan) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {detail.permit_notes && (
                <Card>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                    Permit notes
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{detail.permit_notes}</p>
                </Card>
              )}
              {detail.resupply_plan && (
                <Card>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                    Resupply
                  </p>
                  <p className="mt-1 text-sm text-content-muted">{detail.resupply_plan}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
