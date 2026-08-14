import { useEffect, useState, type FormEvent } from "react";
import { getOverlandingDetail, updateOverlandingDetail } from "@/modes/overlanding/api";
import type { OverlandingDetail } from "@/modes/overlanding/types";

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

const DRIVETRAIN_OPTIONS = ["", "4WD", "AWD", "RWD", "FWD"];

const RECOVERY_GEAR_OPTIONS = [
  { label: "Not sure yet", value: "" },
  { label: "Yes, packed", value: "true" },
  { label: "No", value: "false" },
];

export default function OverlandingPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<OverlandingDetail | null>(null);
  const [vehicleName, setVehicleName] = useState("");
  const [fuelCapacity, setFuelCapacity] = useState("");
  const [fuelEconomy, setFuelEconomy] = useState("");
  const [groundClearance, setGroundClearance] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [hasRecoveryGear, setHasRecoveryGear] = useState("");
  const [commsPlan, setCommsPlan] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOverlandingDetail(tripId).then((d) => {
      setDetail(d);
      setVehicleName(d.vehicle_name ?? "");
      setFuelCapacity(d.fuel_capacity_gal?.toString() ?? "");
      setFuelEconomy(d.fuel_economy_mpg?.toString() ?? "");
      setGroundClearance(d.ground_clearance_in?.toString() ?? "");
      setDrivetrain(d.drivetrain ?? "");
      setHasRecoveryGear(d.has_recovery_gear === null ? "" : String(d.has_recovery_gear));
      setCommsPlan(d.comms_plan ?? "");
      setEmergencyContact(d.emergency_contact ?? "");
    });
  }, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateOverlandingDetail(tripId, {
        vehicle_name: vehicleName || null,
        fuel_capacity_gal: fuelCapacity ? Number(fuelCapacity) : null,
        fuel_economy_mpg: fuelEconomy ? Number(fuelEconomy) : null,
        ground_clearance_in: groundClearance ? Number(groundClearance) : null,
        drivetrain: drivetrain || null,
        has_recovery_gear: hasRecoveryGear === "" ? null : hasRecoveryGear === "true",
        comms_plan: commsPlan || null,
        emergency_contact: emergencyContact || null,
      });
      setDetail(updated);
      onChange?.();
    } finally {
      setSaving(false);
    }
  }

  if (!detail) return null;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-emerald-900/50 bg-emerald-500/5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">🚙 Overlanding details</h2>
        {detail.est_range_miles !== null && (
          <span className="text-sm text-emerald-400">
            Est. range: {detail.est_range_miles} mi
          </span>
        )}
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Vehicle
          </label>
          <input
            type="text"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Drivetrain
          </label>
          <select
            value={drivetrain}
            onChange={(e) => setDrivetrain(e.target.value)}
            className={inputClass}
          >
            {DRIVETRAIN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option || "Not sure yet"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Fuel capacity (gal)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={fuelCapacity}
            onChange={(e) => setFuelCapacity(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Fuel economy (mpg)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={fuelEconomy}
            onChange={(e) => setFuelEconomy(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Ground clearance (in)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={groundClearance}
            onChange={(e) => setGroundClearance(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Recovery gear packed
          </label>
          <select
            value={hasRecoveryGear}
            onChange={(e) => setHasRecoveryGear(e.target.value)}
            className={inputClass}
          >
            {RECOVERY_GEAR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Comms plan
          </label>
          <textarea
            value={commsPlan}
            onChange={(e) => setCommsPlan(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Emergency contact
          </label>
          <input
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50 sm:col-span-2 sm:w-fit"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
