import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createGear, deleteGear, listGear, updateGear } from "@/api/trips";
import type { Collaborator, Gear, GearRequiredLevel } from "@/api/types";

const REQUIRED_LEVELS: GearRequiredLevel[] = ["required", "optional"];

const REQUIRED_LEVEL_LABEL: Record<GearRequiredLevel, string> = {
  required: "Required",
  optional: "Optional",
};

const REQUIRED_LEVEL_STYLE: Record<GearRequiredLevel, string> = {
  required: "border-rose-900 bg-rose-950/40 text-rose-300",
  optional: "border-amber-900 bg-amber-950/40 text-amber-300",
};

const UNCATEGORIZED = "Uncategorized";

interface Draft {
  name: string;
  category: string;
  weightOz: string;
  notes: string;
}

function draftFrom(item: Gear): Draft {
  return {
    name: item.name,
    category: item.category ?? "",
    weightOz: item.weight_oz?.toString() ?? "",
    notes: item.notes ?? "",
  };
}

export default function GearSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [gear, setGear] = useState<Gear[]>([]);
  const [roster, setRoster] = useState<Collaborator[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [weightOz, setWeightOz] = useState("");
  const [requiredLevel, setRequiredLevel] = useState<GearRequiredLevel>("required");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

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

  async function handleDelete(id: number) {
    await deleteGear(id);
    refresh();
    onChange?.();
  }

  function startEdit(item: Gear) {
    setEditingId(item.id);
    setDraft(draftFrom(item));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit(id: number) {
    if (!draft) return;
    await updateGear(id, {
      name: draft.name,
      category: draft.category.trim() || null,
      weight_oz: draft.weightOz ? Number(draft.weightOz) : null,
      notes: draft.notes.trim() || null,
    });
    setEditingId(null);
    setDraft(null);
    refresh();
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
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Packing List</h2>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            title="Add gear"
            className="text-slate-500 hover:text-emerald-300"
          >
            +
          </button>
        )}
      </div>

      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              title="Close"
              className="text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              autoFocus
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
          <div className="flex flex-wrap items-center gap-2">
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
              title="Add"
              className="text-xl text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              ✓
            </button>
          </div>
        </form>
      )}

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
              {items.map((item) =>
                editingId === item.id && draft ? (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1.5 rounded-md border border-slate-800 px-3 py-2"
                  >
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Category"
                        value={draft.category}
                        onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                        className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="oz"
                        value={draft.weightOz}
                        onChange={(e) => setDraft({ ...draft, weightOz: e.target.value })}
                        className="w-16 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Notes"
                      value={draft.notes}
                      onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(item.id)}
                        title="Save"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEdit}
                        title="Cancel"
                        className="text-slate-500 hover:text-slate-300"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ) : (
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
                            item.packed ? "text-slate-500 line-through" : "text-sm text-slate-100"
                          }
                        >
                          {item.name}
                        </span>
                        {item.weight_oz !== null && (
                          <span className="text-xs text-slate-500">{item.weight_oz} oz</span>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          title="Edit"
                          className="text-slate-500 hover:text-emerald-300"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          className="text-slate-600 hover:text-red-400"
                        >
                          −
                        </button>
                      </div>
                    </div>

                    {item.notes && <p className="ml-6 text-xs text-slate-500 italic">{item.notes}</p>}

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
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
