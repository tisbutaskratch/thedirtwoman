import { useEffect, useState, type FormEvent } from "react";
import { getMotocampingDetail, updateMotocampingDetail } from "@/modes/motocamping/api";
import type { MotocampingDetail } from "@/modes/motocamping/types";

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

export default function MotocampingPanel({
  tripId,
  onChange,
  onDetailChange,
}: {
  tripId: number;
  onChange?: () => void;
  onDetailChange?: (detail: MotocampingDetail) => void;
}) {
  const [detail, setDetail] = useState<MotocampingDetail | null>(null);
  const [motorcycleName, setMotorcycleName] = useState("");
  const [fuelCapacity, setFuelCapacity] = useState("");
  const [fuelEconomy, setFuelEconomy] = useState("");
  const [dailyTarget, setDailyTarget] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMotocampingDetail(tripId).then((d) => {
      setDetail(d);
      setMotorcycleName(d.motorcycle_name ?? "");
      setFuelCapacity(d.fuel_capacity_gal?.toString() ?? "");
      setFuelEconomy(d.fuel_economy_mpg?.toString() ?? "");
      setDailyTarget(d.daily_ride_target_miles?.toString() ?? "");
      onDetailChange?.(d);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMotocampingDetail(tripId, {
        motorcycle_name: motorcycleName || null,
        fuel_capacity_gal: fuelCapacity ? Number(fuelCapacity) : null,
        fuel_economy_mpg: fuelEconomy ? Number(fuelEconomy) : null,
        daily_ride_target_miles: dailyTarget ? Number(dailyTarget) : null,
      });
      setDetail(updated);
      onChange?.();
      onDetailChange?.(updated);
    } finally {
      setSaving(false);
    }
  }

  if (!detail) return null;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-emerald-900/50 bg-emerald-500/5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">🏍️ Motocamping details</h2>
        {detail.est_range_miles !== null && (
          <span className="text-sm text-emerald-400">
            Est. range: {detail.est_range_miles} mi
          </span>
        )}
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Motorcycle
          </label>
          <input
            type="text"
            value={motorcycleName}
            onChange={(e) => setMotorcycleName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Daily ride target (mi)
          </label>
          <input
            type="number"
            min={0}
            value={dailyTarget}
            onChange={(e) => setDailyTarget(e.target.value)}
            className={inputClass}
          />
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
