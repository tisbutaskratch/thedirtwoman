import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createGear, listGear, updateGear } from "@/api/trips";
import type { Collaborator, Gear, GearRequiredLevel } from "@/api/types";

const REQUIRED_LEVELS: GearRequiredLevel[] = ["required", "suggested", "optional"];

const REQUIRED_LEVEL_LABEL: Record<GearRequiredLevel, string> = {
  required: "Required",
  suggested: "Suggested",
  optional: "Optional",
};

const REQUIRED_LEVEL_STYLE: Record<GearRequiredLevel, string> = {
  required: "border-rose-900 bg-rose-950/40 text-rose-300",
  suggested: "border-amber-900 bg-amber-950/40 text-amber-300",
  optional: "border-slate-700 bg-slate-800/60 text-slate-400",
};

const UNCATEGORIZED = "Uncategorized";

export default function GearSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [gear, setGear] = useState<Gear[]>([]);
  const [roster, setRoster] = useState<Collaborator[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [weightOz, setWeightOz] = useState("");
  const [requiredLevel, setRequiredLevel] = useState<GearRequiredLevel>("required");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listGear(tripId).then(setGear);
    listCollaborators(tripId).then(setRoster);
  }

  useEffect(refresh, [tripId]);

  const nameByUserId = useMemo(() => {
    const map = new Map<number, string>();
    roster.forEach((c) => map.set(c.user_id, c.name));
    return map;
  }, [roster]);

  const categories = useMemo(() => {
    const existing = new Set(gear.map((g) => g.category ?? UNCATEGORIZED));
    return Array.from(existing).sort();
  }, [gear]);

  const grouped = useMemo(() => {
    const map = new Map<string, Gear[]>();
    for (const item of gear) {
      const key = item.category ?? UNCATEGORIZED;
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [gear]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createGear(tripId, {
        name,
        category: category.trim() || null,
        weight_oz: weightOz ? Number(weightOz) : null,
        required_level: requiredLevel,
        assigned_to_user_id: assignedTo ? Number(assignedTo) : null,
        notes: notes.trim() || null,
      });
      setName("");
      setCategory("");
      setWeightOz("");
      setRequiredLevel("required");
      setAssignedTo("");
      setNotes("");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePacked(item: Gear) {
    await updateGear(item.id, { packed: !item.packed });
    refresh();
    onChange?.();
  }

  async function changeRequiredLevel(item: Gear, level: GearRequiredLevel) {
    await updateGear(item.id, { required_level: level });
    refresh();
  }

  async function changeAssignedTo(item: Gear, value: string) {
    await updateGear(item.id, { assigned_to_user_id: value ? Number(value) : null });
    refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Gear</h2>

      {grouped.length === 0 && <p className="text-sm text-slate-500">No gear yet.</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {grouped.map(([categoryName, items]) => (
          <div
            key={categoryName}
            className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
          >
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              {categoryName}
            </h3>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1.5 rounded-md border border-slate-800 px-3 py-2"
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => togglePacked(item)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500"
                    />
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <span
                        className={
                          item.packed
                            ? "text-slate-500 line-through"
                            : "text-sm text-slate-100"
                        }
                      >
                        {item.name}
                      </span>
                      {item.weight_oz !== null && (
                        <span className="text-xs text-slate-500">{item.weight_oz} oz</span>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="ml-6 text-xs text-slate-500 italic">{item.notes}</p>
                  )}

                  <div className="ml-6 flex flex-wrap items-center gap-2">
                    <select
                      value={item.required_level}
                      onChange={(e) =>
                        changeRequiredLevel(item, e.target.value as GearRequiredLevel)
                      }
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium outline-none ${REQUIRED_LEVEL_STYLE[item.required_level]}`}
                    >
                      {REQUIRED_LEVELS.map((level) => (
                        <option key={level} value={level} className="bg-slate-900 text-slate-100">
                          {REQUIRED_LEVEL_LABEL[level]}
                        </option>
                      ))}
                    </select>

                    <select
                      value={item.assigned_to_user_id ?? ""}
                      onChange={(e) => changeAssignedTo(item, e.target.value)}
                      className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-300 outline-none"
                    >
                      <option value="">Unassigned</option>
                      {roster.map((c) => (
                        <option key={c.user_id} value={c.user_id}>
                          {nameByUserId.get(c.user_id) ?? c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
      >
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Gear item"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            list="gear-categories"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-40 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          <datalist id="gear-categories">
            {categories
              .filter((c) => c !== UNCATEGORIZED)
              .map((c) => (
                <option key={c} value={c} />
              ))}
          </datalist>
          <input
            type="number"
            min={0}
            step="0.1"
            placeholder="oz"
            value={weightOz}
            onChange={(e) => setWeightOz(e.target.value)}
            className="w-20 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={requiredLevel}
            onChange={(e) => setRequiredLevel(e.target.value as GearRequiredLevel)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          >
            {REQUIRED_LEVELS.map((level) => (
              <option key={level} value={level}>
                {REQUIRED_LEVEL_LABEL[level]}
              </option>
            ))}
          </select>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          >
            <option value="">Unassigned</option>
            {roster.map((c) => (
              <option key={c.user_id} value={c.user_id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
    </section>
  );
}
