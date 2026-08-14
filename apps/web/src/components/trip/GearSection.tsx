import { useEffect, useState, type FormEvent } from "react";
import { createGear, listGear, updateGear } from "@/api/trips";
import type { Gear } from "@/api/types";

export default function GearSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [gear, setGear] = useState<Gear[]>([]);
  const [name, setName] = useState("");
  const [weightOz, setWeightOz] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listGear(tripId).then(setGear);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createGear(tripId, { name, weight_oz: weightOz ? Number(weightOz) : null });
      setName("");
      setWeightOz("");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePacked(item: Gear) {
    await updateGear(item.id, { packed: !item.packed });
    refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Gear</h2>
      <ul className="flex flex-col gap-2">
        {gear.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-md border border-slate-800 px-4 py-2"
          >
            <input
              type="checkbox"
              checked={item.packed}
              onChange={() => togglePacked(item)}
              className="h-4 w-4 accent-emerald-500"
            />
            <span className={item.packed ? "text-slate-500 line-through" : "text-slate-100"}>
              {item.name}
            </span>
            {item.weight_oz !== null && (
              <span className="ml-auto text-xs text-slate-500">{item.weight_oz} oz</span>
            )}
          </li>
        ))}
        {gear.length === 0 && <p className="text-sm text-slate-500">No gear yet.</p>}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Gear item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <input
          type="number"
          min={0}
          step="0.1"
          placeholder="oz"
          value={weightOz}
          onChange={(e) => setWeightOz(e.target.value)}
          className="w-20 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  );
}
