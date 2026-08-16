import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createGear, deleteGear, listGear, updateGear } from "@/api/trips";
import type { Collaborator, Gear, GearRequiredLevel } from "@/api/types";
import { AddForm, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import { SECTION_META } from "@/lib/tripTypes";

const REQUIRED_LEVELS: GearRequiredLevel[] = ["required", "optional"];

const REQUIRED_LEVEL_LABEL: Record<GearRequiredLevel, string> = {
  required: "Required",
  optional: "Optional",
};

const REQUIRED_LEVEL_STYLE: Record<GearRequiredLevel, string> = {
  required: "border-rose-800/60 bg-rose-950/50 text-rose-300",
  optional: "border-amber-800/60 bg-amber-950/50 text-amber-300",
};

const UNCATEGORIZED = "Uncategorized";

/** A glyph per common packing-list category, purely to make the grid scannable. */
function categoryGlyph(name: string) {
  const n = name.toLowerCase();
  if (n.includes("riding") || n.includes("moto")) return "🏍️";
  if (n.includes("camp") || n.includes("sleep")) return "⛺";
  if (n.includes("tool") || n.includes("repair")) return "🔧";
  if (n.includes("cook") || n.includes("food") || n.includes("kitchen")) return "🍳";
  if (n.includes("cloth") || n.includes("layer")) return "🧥";
  if (n.includes("water") || n.includes("consum")) return "💧";
  if (n.includes("comfort")) return "🛋️";
  if (n.includes("nav") || n.includes("electro")) return "🧭";
  if (n.includes("first") || n.includes("med")) return "🩹";
  return "🎒";
}

interface Draft {
  name: string;
  category: string;
  weightOz: string;
  notes: string;
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

  const categories = useMemo(
    () => Array.from(new Set(gear.map((g) => g.category ?? UNCATEGORIZED))).sort(),
    [gear],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Gear[]>();
    for (const item of gear) {
      const key = item.category ?? UNCATEGORIZED;
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [gear]);

  const packedCount = gear.filter((g) => g.packed).length;

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
      setWeightOz("");
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

  return (
    <Section
      icon={SECTION_META.packing.icon}
      title="Packing list"
      tone={SECTION_META.packing.tone}
      actions={
        <>
          {gear.length > 0 && (
            <span className="mr-1 text-xs tabular-nums text-content-subtle">
              {packedCount}/{gear.length} packed
            </span>
          )}
          {!showAdd && (
            <IconButton onClick={() => setShowAdd(true)} title="Add gear">
              +
            </IconButton>
          )}
        </>
      }
    >
      {showAdd && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Gear item"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="text"
              list="gear-categories"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputClass} w-40`}
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
              className={`${inputClass} w-20`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={requiredLevel}
              onChange={(e) => setRequiredLevel(e.target.value as GearRequiredLevel)}
              className={`${inputClass} w-32`}
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
              className={`${inputClass} w-36`}
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
              className={`${inputClass} flex-1`}
            />
          </div>
        </AddForm>
      )}

      {grouped.length === 0 ? (
        <EmptyState icon="🎒" message="Nothing on the packing list yet." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {grouped.map(([categoryName, items]) => (
            <div
              key={categoryName}
              className="flex flex-col gap-2 rounded-card border border-edge bg-surface-raised p-3"
            >
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-content-muted">
                <span aria-hidden>{categoryGlyph(categoryName)}</span>
                {categoryName}
                <span className="ml-auto font-normal tabular-nums text-content-subtle">
                  {items.filter((i) => i.packed).length}/{items.length}
                </span>
              </h3>
              <ul className="flex flex-col gap-1">
                {items.map((item) =>
                  editingId === item.id && draft ? (
                    <li key={item.id} className="flex flex-col gap-1.5 rounded-md bg-surface-sunken p-2">
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className={`${inputClass} py-1 text-xs`}
                      />
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Category"
                          value={draft.category}
                          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                          className={`${inputClass} flex-1 py-1 text-xs`}
                        />
                        <input
                          type="number"
                          min={0}
                          step="0.1"
                          placeholder="oz"
                          value={draft.weightOz}
                          onChange={(e) => setDraft({ ...draft, weightOz: e.target.value })}
                          className={`${inputClass} w-16 py-1 text-xs`}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Notes"
                        value={draft.notes}
                        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                        className={`${inputClass} py-1 text-xs`}
                      />
                      <div className="flex justify-end gap-1">
                        <IconButton onClick={() => saveEdit(item.id)} title="Save" variant="confirm">
                          ✓
                        </IconButton>
                        <IconButton onClick={() => setEditingId(null)} title="Cancel">
                          ×
                        </IconButton>
                      </div>
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="group flex items-start gap-2 rounded-md px-1 py-1 hover:bg-surface-overlay"
                    >
                      <input
                        type="checkbox"
                        checked={item.packed}
                        onChange={() => togglePacked(item)}
                        className="mt-1 h-3.5 w-3.5 shrink-0 accent-emerald-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm ${item.packed ? "text-content-subtle line-through" : "text-content"}`}
                        >
                          {item.name}
                          {item.weight_oz !== null && (
                            <span className="ml-1.5 text-xs text-content-subtle">
                              {item.weight_oz}oz
                            </span>
                          )}
                        </p>
                        {item.notes && (
                          <p className="truncate text-xs italic text-content-subtle">{item.notes}</p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <select
                            value={item.required_level}
                            onChange={(e) =>
                              updateGear(item.id, {
                                required_level: e.target.value as GearRequiredLevel,
                              }).then(refresh)
                            }
                            className={`rounded-full border px-1.5 py-0 text-[11px] outline-none ${REQUIRED_LEVEL_STYLE[item.required_level]}`}
                          >
                            {REQUIRED_LEVELS.map((level) => (
                              <option key={level} value={level} className="bg-surface text-content">
                                {REQUIRED_LEVEL_LABEL[level]}
                              </option>
                            ))}
                          </select>
                          <select
                            value={item.assigned_to_user_id ?? ""}
                            onChange={(e) =>
                              updateGear(item.id, {
                                assigned_to_user_id: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }).then(refresh)
                            }
                            className="rounded-full border border-edge bg-surface-overlay px-1.5 py-0 text-[11px] text-content-muted outline-none"
                          >
                            <option value="">Unassigned</option>
                            {roster.map((c) => (
                              <option key={c.user_id} value={c.user_id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <IconButton
                          onClick={() => {
                            setEditingId(item.id);
                            setDraft({
                              name: item.name,
                              category: item.category ?? "",
                              weightOz: item.weight_oz?.toString() ?? "",
                              notes: item.notes ?? "",
                            });
                          }}
                          title="Edit"
                        >
                          ✎
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          variant="danger"
                        >
                          −
                        </IconButton>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
