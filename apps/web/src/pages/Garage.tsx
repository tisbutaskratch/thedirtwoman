import { useEffect, useState, type FormEvent } from "react";
import { createRig, deleteRig, listRigs, updateRig } from "@/api/rigs";
import type { Rig, RigKind } from "@/api/types";
import {
  AddForm,
  ConfirmDialog,
  Emoji,
  EmptyState,
  Field,
  IconButton,
  Section,
  inputClass,
} from "@/components/ui";
import KitsSection from "@/components/KitsSection";

/*
 * The garage: the things you own that outlive a trip.
 *
 * Holds rigs and kits both, so a backpacker with no vehicle still has a
 * garage full of kits here. The name is the familiar one rather than the
 * literal one on purpose.
 *
 * Separate from trips on purpose. A rig has its own life: you buy it, you
 * change its tyres, you sell it, and none of that is a trip event. Bringing
 * one on a trip copies its details across rather than linking, so selling
 * the truck never edits what you rode last autumn.
 */

const KINDS: { value: RigKind; label: string; glyph: string }[] = [
  { value: "motorcycle", label: "Motorcycle", glyph: "🏍️" },
  { value: "truck", label: "Truck", glyph: "🛻" },
  { value: "suv", label: "SUV", glyph: "🚙" },
  { value: "van", label: "Van", glyph: "🚐" },
  { value: "car", label: "Car", glyph: "🚗" },
  { value: "other", label: "Other", glyph: "🔧" },
];

export const RIG_GLYPH = Object.fromEntries(
  KINDS.map((k) => [k.value, k.glyph]),
) as Record<RigKind, string>;

const BLANK = {
  name: "",
  kind: "other" as RigKind,
  make: "",
  model: "",
  year: "",
  fuel_capacity_gal: "",
  fuel_economy_mpg: "",
  ground_clearance_in: "",
  tire_size: "",
  drivetrain: "",
  notes: "",
};

export default function Garage() {
  const [rigs, setRigs] = useState<Rig[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Rig | null>(null);

  function refresh() {
    listRigs().then(setRigs);
  }

  useEffect(refresh, []);

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  function startEdit(rig: Rig) {
    setEditingId(rig.id);
    setShowAdd(false);
    setForm({
      name: rig.name,
      kind: rig.kind,
      make: rig.make ?? "",
      model: rig.model ?? "",
      year: rig.year === null ? "" : String(rig.year),
      fuel_capacity_gal: rig.fuel_capacity_gal === null ? "" : String(rig.fuel_capacity_gal),
      fuel_economy_mpg: rig.fuel_economy_mpg === null ? "" : String(rig.fuel_economy_mpg),
      ground_clearance_in:
        rig.ground_clearance_in === null ? "" : String(rig.ground_clearance_in),
      tire_size: rig.tire_size ?? "",
      drivetrain: rig.drivetrain ?? "",
      notes: rig.notes ?? "",
    });
  }

  function payload() {
    const num = (v: string) => (v === "" ? null : Number(v));
    return {
      name: form.name.trim(),
      kind: form.kind,
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      year: num(form.year),
      fuel_capacity_gal: num(form.fuel_capacity_gal),
      fuel_economy_mpg: num(form.fuel_economy_mpg),
      ground_clearance_in: num(form.ground_clearance_in),
      tire_size: form.tire_size.trim() || null,
      drivetrain: form.drivetrain.trim() || null,
      notes: form.notes.trim() || null,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId !== null) {
        await updateRig(editingId, payload());
      } else {
        await createRig(payload());
      }
      setForm(BLANK);
      setShowAdd(false);
      setEditingId(null);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const rig = pendingDelete;
    setPendingDelete(null);
    if (!rig) return;
    await deleteRig(rig.id);
    refresh();
  }

  const fields = (
    <>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
        <input
          type="text"
          autoFocus
          placeholder="What you call it. The Tacoma, Big Red…"
          value={form.name}
          onChange={set("name")}
          className={inputClass}
        />
        <select
          value={form.kind}
          onChange={set("kind")}
          aria-label="What sort of rig"
          className={inputClass}
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.glyph} {k.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="Year">
          <input type="number" value={form.year} onChange={set("year")} className={inputClass} />
        </Field>
        <Field label="Make">
          <input
            type="text"
            placeholder="Toyota"
            value={form.make}
            onChange={set("make")}
            className={inputClass}
          />
        </Field>
        <Field label="Model">
          <input
            type="text"
            placeholder="Tacoma"
            value={form.model}
            onChange={set("model")}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-2 sm:grid-cols-5">
        <Field label="Tank (gal)">
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.fuel_capacity_gal}
            onChange={set("fuel_capacity_gal")}
            className={inputClass}
          />
        </Field>
        <Field label="MPG">
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.fuel_economy_mpg}
            onChange={set("fuel_economy_mpg")}
            className={inputClass}
          />
        </Field>
        <Field label="Clearance (in)">
          <input
            type="number"
            min={0}
            step="0.1"
            value={form.ground_clearance_in}
            onChange={set("ground_clearance_in")}
            className={inputClass}
          />
        </Field>
        <Field label="Tyres">
          <input
            type="text"
            placeholder="265/70R17"
            value={form.tire_size}
            onChange={set("tire_size")}
            className={inputClass}
          />
        </Field>
        <Field label="Drivetrain">
          <input
            type="text"
            placeholder="4WD"
            value={form.drivetrain}
            onChange={set("drivetrain")}
            className={inputClass}
          />
        </Field>
      </div>
      <textarea
        rows={2}
        placeholder="Notes. Mods, quirks, what it needs next."
        value={form.notes}
        onChange={set("notes")}
        className={inputClass}
      />
    </>
  );

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Garage</h1>
        <p className="mt-1 text-sm text-content-muted">
          Set your rigs and kits up once, then pull them onto any trip instead of typing them out
          every time.
        </p>
      </div>

      <Section
        glyph="🔧"
        title="Rigs"
        count={rigs?.length}
        tone="amber"
        actions={
          <div className="flex items-center gap-1.5">
            <IconButton
              onClick={() => {
                setShowAdd((open) => !open);
                setEditingId(null);
                setForm(BLANK);
              }}
              title="Add a rig"
              icon="add"
            />
          </div>
        }
      >
        {showAdd && (
          <AddForm
            onSubmit={handleSubmit}
            onClose={() => setShowAdd(false)}
            submitting={saving}
            submitTitle="Add rig"
          >
            {fields}
          </AddForm>
        )}

        {rigs !== null && rigs.length === 0 && !showAdd && (
          <EmptyState
            glyph="🔧"
            message="No rigs yet. Add one and it will be waiting on your next trip."
          />
        )}

        {rigs?.map((rig) =>
          editingId === rig.id ? (
            <AddForm
              key={rig.id}
              onSubmit={handleSubmit}
              onClose={() => setEditingId(null)}
              submitting={saving}
              submitTitle="Save"
            >
              {fields}
            </AddForm>
          ) : (
            <div
              key={rig.id}
              className="flex flex-wrap items-center gap-3 rounded-card border border-edge bg-surface-raised px-3 py-2.5"
            >
              <Emoji glyph={RIG_GLYPH[rig.kind]} size="lg" />
              <div className="min-w-0">
                <p className="font-semibold leading-snug">
                  {rig.name}
                </p>
                <p className="text-xs text-content-subtle">
                  {[
                    rig.description,
                    rig.est_range_miles !== null ? `${rig.est_range_miles} mi range` : null,
                    rig.ground_clearance_in !== null ? `${rig.ground_clearance_in}" clearance` : null,
                    rig.tire_size,
                    rig.drivetrain,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No details yet"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <IconButton onClick={() => startEdit(rig)} title="Edit" icon="edit" />
                <IconButton
                  onClick={() => setPendingDelete(rig)}
                  title="Delete"
                  icon="delete"
                />
              </div>
            </div>
          ),
        )}
      </Section>

      <KitsSection />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? "this rig"}?`}
        // Worth saying plainly, because "delete" usually means losing
        // history and here it does not.
        body="This removes it from your garage. Trips you took it on keep their own record of what you brought, so nothing there changes."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
