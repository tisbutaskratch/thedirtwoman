import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listCollaborators } from "@/api/sharing";
import { createGear, deleteGear, listGear, updateGear } from "@/api/trips";
import type { Collaborator, Gear, GearRequiredLevel } from "@/api/types";
import { AddForm, Emoji, EmptyState, IconButton, Section, inputClass } from "@/components/ui";
import AssigneeSelect from "@/components/trip/AssigneeSelect";
import RequiredLevelChip, {
  REQUIRED_LEVELS,
  REQUIRED_LEVEL_LABEL,
} from "@/components/trip/RequiredLevelChip";
import { assigneeValue, assignmentPayload } from "@/lib/assignment";
import { SECTION_META } from "@/lib/tripTypes";

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
  // Weighed items only — an unweighed item shouldn't silently count as 0 oz,
  // so the heading says how many are still missing a weight.
  const weighed = gear.filter((g) => g.weight_oz !== null);
  const totalOz = weighed.reduce((sum, g) => sum + (g.weight_oz ?? 0), 0);
  const missingWeight = gear.length - weighed.length;

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
        ...assignmentPayload(assignedTo),
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
      glyph={SECTION_META.packing.glyph}
      title="Packing list"
      tone={SECTION_META.packing.tone}
      count={gear.length}
      meta={
        gear.length > 0
          ? `${packedCount} packed · ${(totalOz / 16).toFixed(1)} lb${
              missingWeight > 0 ? ` (${missingWeight} unweighed)` : ""
            }`
          : undefined
      }
      actions={
        !showAdd && <IconButton onClick={() => setShowAdd(true)} title="Add gear" icon="add" />
      }
    >
      {showAdd && (
        <AddForm onSubmit={handleSubmit} onClose={() => setShowAdd(false)} submitting={submitting}>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_5rem]">
            <input
              type="text"
              autoFocus
              placeholder="Gear item"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              list="gear-categories"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
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
              aria-label="Weight in ounces"
              value={weightOz}
              onChange={(e) => setWeightOz(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[8rem_9rem_minmax(0,1fr)]">
            <select
              value={requiredLevel}
              aria-label="Required level"
              onChange={(e) => setRequiredLevel(e.target.value as GearRequiredLevel)}
              className={inputClass}
            >
              {REQUIRED_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {REQUIRED_LEVEL_LABEL[level]}
                </option>
              ))}
            </select>
            <AssigneeSelect value={assignedTo} onChange={setAssignedTo} roster={roster} />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>
        </AddForm>
      )}

      {grouped.length === 0 ? (
        <EmptyState glyph="🎒" message="Nothing on the packing list yet." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {grouped.map(([categoryName, items]) => (
            <div
              key={categoryName}
              className="flex flex-col gap-2 rounded-card border border-edge bg-surface-raised p-3"
            >
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-content-muted">
                <Emoji glyph={categoryGlyph(categoryName)} size="sm" />
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
                      <div className="grid grid-cols-[minmax(0,1fr)_4rem] gap-1.5">
                        <input
                          type="text"
                          placeholder="Category"
                          value={draft.category}
                          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                          className={`${inputClass} py-1 text-xs`}
                        />
                        <input
                          type="number"
                          min={0}
                          step="0.1"
                          placeholder="oz"
                          aria-label="Weight in ounces"
                          value={draft.weightOz}
                          onChange={(e) => setDraft({ ...draft, weightOz: e.target.value })}
                          className={`${inputClass} py-1 text-xs`}
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
                        <IconButton onClick={() => saveEdit(item.id)} title="Save" variant="confirm" icon="confirm" />
                        <IconButton onClick={() => setEditingId(null)} title="Cancel" icon="close" />
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
                          <RequiredLevelChip
                            value={item.required_level}
                            onChange={(level) =>
                              updateGear(item.id, { required_level: level }).then(refresh)
                            }
                          />
                          <AssigneeSelect
                            value={assigneeValue(item)}
                            onChange={(v) => updateGear(item.id, assignmentPayload(v)).then(refresh)}
                            roster={roster}
                            variant="chip"
                            highlighted={item.assigned_to_all}
                          />
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
                          icon="edit"
                        />
                        <IconButton
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          variant="danger"
                          icon="remove"
                        />
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
