import { useEffect, useState, type FormEvent } from "react";
import { getBackpackingDetail, updateBackpackingDetail } from "@/modes/backpacking/api";
import type { BackpackingDetail } from "@/modes/backpacking/types";

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

const PERMIT_OPTIONS = [
  { label: "Not sure yet", value: "" },
  { label: "Yes, permit required", value: "true" },
  { label: "No permit needed", value: "false" },
];

export default function BackpackingPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<BackpackingDetail | null>(null);
  const [basePackWeight, setBasePackWeight] = useState("");
  const [permitRequired, setPermitRequired] = useState("");
  const [permitNotes, setPermitNotes] = useState("");
  const [resupplyPlan, setResupplyPlan] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBackpackingDetail(tripId).then((d) => {
      setDetail(d);
      setBasePackWeight(d.base_pack_weight_oz?.toString() ?? "");
      setPermitRequired(d.permit_required === null ? "" : String(d.permit_required));
      setPermitNotes(d.permit_notes ?? "");
      setResupplyPlan(d.resupply_plan ?? "");
    });
  }, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateBackpackingDetail(tripId, {
        base_pack_weight_oz: basePackWeight ? Number(basePackWeight) : null,
        permit_required: permitRequired === "" ? null : permitRequired === "true",
        permit_notes: permitNotes || null,
        resupply_plan: resupplyPlan || null,
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
        <h2 className="text-xl font-semibold">🥾 Backpacking details</h2>
        {detail.est_pack_weight_oz !== null && (
          <span className="text-sm text-emerald-400">
            Est. pack weight: {detail.est_pack_weight_oz} oz
          </span>
        )}
      </div>
      {detail.est_pack_weight_oz !== null && (
        <p className="text-xs text-slate-500">
          Base weight ({detail.base_pack_weight_oz} oz) + gear list ({detail.gear_weight_oz} oz,
          see Gear below)
        </p>
      )}
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Base pack weight (oz)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={basePackWeight}
            onChange={(e) => setBasePackWeight(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Permit
          </label>
          <select
            value={permitRequired}
            onChange={(e) => setPermitRequired(e.target.value)}
            className={inputClass}
          >
            {PERMIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {permitRequired === "true" && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
              Permit notes
            </label>
            <textarea
              value={permitNotes}
              onChange={(e) => setPermitNotes(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Resupply plan
          </label>
          <textarea
            value={resupplyPlan}
            onChange={(e) => setResupplyPlan(e.target.value)}
            rows={2}
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
