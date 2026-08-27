import { useEffect, useState, type FormEvent } from "react";
import {
  addItem,
  createKit,
  deleteItem,
  deleteKit,
  listKits,
  } from "@/api/kits";
import type { Kit } from "@/api/types";
import {
  AddForm,
  ConfirmDialog,
  Emoji,
  EmptyState,
  IconButton,
  Section,
  inputClass,
} from "@/components/ui";

/*
 * Kits you keep packed.
 *
 * Deliberately not about tools. A camp kitchen, a carry-on, a first aid kit
 * and a trailside repair kit are the same shape, so naming this after any
 * one trip type would have made it useless to the others.
 *
 * A kit is a list you write once. Its payoff is on the trip page, where one
 * button turns it into a dozen packing-list rows already grouped under the
 * kit's name.
 */
export default function KitsSection() {
  const [kits, setKits] = useState<Kit[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [kitName, setBagName] = useState("");
  const [kitNotes, setBagNotes] = useState("");
  const [saving, setSaving] = useState(false);
  // Which kit is currently accepting a new item, so only one row of inputs
  // is open at a time.
  const [addingItemTo, setAddingToolTo] = useState<number | null>(null);
  const [itemName, setToolName] = useState("");
  const [itemQty, setToolQty] = useState("1");
  const [pendingDelete, setPendingDelete] = useState<Kit | null>(null);

  function refresh() {
    listKits().then(setKits);
  }

  useEffect(refresh, []);

  async function handleAddKit(event: FormEvent) {
    event.preventDefault();
    if (!kitName.trim()) return;
    setSaving(true);
    try {
      await createKit({ name: kitName.trim(), notes: kitNotes.trim() || null });
      setBagName("");
      setBagNotes("");
      setShowAdd(false);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddItem(event: FormEvent, kit: Kit) {
    event.preventDefault();
    if (!itemName.trim()) return;
    setSaving(true);
    try {
      await addItem(kit.id, {
        name: itemName.trim(),
        quantity: Math.max(Number(itemQty) || 1, 1),
      });
      setToolName("");
      setToolQty("1");
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(kit: Kit, toolId: number) {
    await deleteItem(kit.id, toolId);
    refresh();
  }

  async function confirmDelete() {
    const kit = pendingDelete;
    setPendingDelete(null);
    if (!kit) return;
    await deleteKit(kit.id);
    refresh();
  }

  return (
    <Section
      glyph="🎒"
      title="Kits"
      count={kits?.length}
      tone="cyan"
      actions={
        <div className="flex items-center gap-1.5">
          <IconButton
            onClick={() => setShowAdd((open) => !open)}
            title="Add a kit"
            icon="add"
          />
        </div>
      }
    >
      {showAdd && (
        <AddForm
          onSubmit={handleAddKit}
          onClose={() => setShowAdd(false)}
          submitting={saving}
          submitTitle="Add kit"
        >
          <input
            type="text"
            autoFocus
            placeholder="Camp kitchen, trailside repair, carry-on…"
            value={kitName}
            onChange={(e) => setBagName(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={kitNotes}
            onChange={(e) => setBagNotes(e.target.value)}
            className={inputClass}
          />
        </AddForm>
      )}

      {kits !== null && kits.length === 0 && !showAdd && (
        <EmptyState
          glyph="🎒"
          message="No kits yet. Write one out once and drop it onto any trip."
        />
      )}

      {kits?.map((kit) => (
        <div
          key={kit.id}
          className="flex flex-col gap-2 rounded-card border border-edge bg-surface-raised p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Emoji glyph="🎒" />
            <div className="min-w-0">
              <p className="font-semibold leading-snug">
                {kit.name}
              </p>
              <p className="text-xs text-content-subtle">
                {kit.items.length === 0
                  ? "Empty"
                  : `${kit.items.length} ${kit.items.length === 1 ? "item" : "items"}`}
                {kit.notes ? ` · ${kit.notes}` : ""}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <IconButton
                onClick={() =>
                  setAddingToolTo((current) => (current === kit.id ? null : kit.id))
                }
                title="Add a item"
                icon="add"
              />
              <IconButton
                onClick={() => setPendingDelete(kit)}
                title="Delete kit"
                icon="delete"
              />
            </div>
          </div>

          {kit.items.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {kit.items.map((item) => (
                <li
                  key={item.id}
                  className="group/item flex items-center gap-1 rounded-full border border-edge bg-surface-overlay px-2.5 py-0.5 text-xs"
                >
                  <span>
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="ml-1 text-content-subtle">x{item.quantity}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(kit, item.id)}
                    title={`Remove ${item.name}`}
                    className="text-content-subtle opacity-0 transition-opacity hover:text-rose-500 group-hover/item:opacity-100"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {addingItemTo === kit.id && (
            <form
              onSubmit={(e) => handleAddItem(e, kit)}
              className="grid grid-cols-[minmax(0,1fr)_4.5rem_auto] items-center gap-1"
            >
              <input
                type="text"
                autoFocus
                placeholder="Stove, headlamp, tyre levers…"
                value={itemName}
                onChange={(e) => setToolName(e.target.value)}
                className={`${inputClass} py-1 text-xs`}
              />
              <input
                type="number"
                min={1}
                aria-label="How many"
                value={itemQty}
                onChange={(e) => setToolQty(e.target.value)}
                className={`${inputClass} py-1 text-xs`}
              />
              <IconButton
                type="submit"
                title="Add"
                variant="confirm"
                icon="confirm"
                disabled={saving}
              />
            </form>
          )}
        </div>
      ))}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? "this kit"}?`}
        body="This removes the kit and everything in it. Trips you already packed it onto keep their own copies, so nothing there changes."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Section>
  );
}
