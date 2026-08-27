import { useEffect, useState, type FormEvent } from "react";
import { getGatheringDetail, updateGatheringDetail } from "@/modes/gathering/api";
import type { GatheringDetail } from "@/modes/gathering/types";
import { Field, IconButton, Section, StatTile, inputClass } from "@/components/ui";

/*
 * The host's panel.
 *
 * The other modes ask about range, water and border paperwork. A
 * get-together asks who is hosting, how many are coming, and whether the
 * food adds up. The two warnings here are the ones that actually ruin a
 * holiday: nobody bringing a main, and more mouths than servings.
 */
export default function GatheringPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<GatheringDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    occasion: "",
    host_name: "",
    headcount: "",
    dietary_notes: "",
    kitchen_notes: "",
  });

  function load() {
    getGatheringDetail(tripId).then((d) => {
      setDetail(d);
      setForm({
        occasion: d.occasion ?? "",
        host_name: d.host_name ?? "",
        headcount: d.headcount === null ? "" : String(d.headcount),
        dietary_notes: d.dietary_notes ?? "",
        kitchen_notes: d.kitchen_notes ?? "",
      });
    });
  }

  useEffect(load, [tripId]);

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateGatheringDetail(tripId, {
        occasion: form.occasion || null,
        host_name: form.host_name || null,
        headcount: form.headcount ? Number(form.headcount) : null,
        dietary_notes: form.dietary_notes || null,
        kitchen_notes: form.kitchen_notes || null,
      });
      setDetail(updated);
      setEditing(false);
      onChange?.();
    } finally {
      setSaving(false);
    }
  }

  if (!detail) return null;

  const shortOnFood = detail.servings_shortfall !== null && detail.servings_shortfall > 0;
  const noMain = detail.claimed_count > 0 && !detail.has_a_main;

  return (
    <Section
      glyph="🏡"
      title="The gathering"
      tone="orange"
      meta={detail.occasion ?? undefined}
      actions={
        !editing && (
          <IconButton onClick={() => setEditing(true)} title="Edit gathering details" icon="edit" />
        )
      }
    >
      {editing ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-card border border-edge bg-surface-overlay p-4"
        >
          <div className="flex justify-end">
            <IconButton onClick={() => setEditing(false)} title="Cancel" icon="close" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Occasion">
              <input
                type="text"
                placeholder="Thanksgiving"
                value={form.occasion}
                onChange={set("occasion")}
                className={inputClass}
              />
            </Field>
            <Field label="Host">
              <input
                type="text"
                placeholder="Mom"
                value={form.host_name}
                onChange={set("host_name")}
                className={inputClass}
              />
            </Field>
            <Field label="How many coming">
              <input
                type="number"
                min={0}
                value={form.headcount}
                onChange={set("headcount")}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Allergies and diets">
            <textarea
              rows={2}
              placeholder="Nina is gluten free, Dad does not eat pork"
              value={form.dietary_notes}
              onChange={set("dietary_notes")}
              className={inputClass}
            />
          </Field>
          <Field label="Kitchen">
            <textarea
              rows={2}
              placeholder="One oven, so nothing that needs an hour at 400"
              value={form.kitchen_notes}
              onChange={set("kitchen_notes")}
              className={inputClass}
            />
          </Field>
          <div className="flex justify-end">
            <IconButton
              type="submit"
              title="Save"
              variant="confirm"
              icon="confirm"
              size={19}
              disabled={saving}
            />
          </div>
        </form>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Host" value={detail.host_name} tone="orange" />
            <StatTile
              label="Coming"
              value={detail.headcount}
              unit={detail.headcount === 1 ? "person" : "people"}
              tone="orange"
            />
            <StatTile
              label="Claimed"
              value={detail.claimed_count + detail.unclaimed_count > 0
                ? `${detail.claimed_count} of ${detail.claimed_count + detail.unclaimed_count}`
                : null}
              hint={
                detail.unclaimed_count > 0
                  ? `${detail.unclaimed_count} still needs somebody`
                  : "Everything has a name on it"
              }
              tone="orange"
              status={detail.unclaimed_count > 0 ? "warn" : "ok"}
            />
            <StatTile
              label="Food covers"
              value={detail.est_servings}
              unit="servings"
              hint={
                detail.est_servings === null
                  ? "Add serving sizes to see this"
                  : shortOnFood
                    ? `About ${detail.servings_shortfall} short`
                    : "Enough to go round"
              }
              tone="orange"
              status={detail.est_servings === null ? "none" : shortOnFood ? "warn" : "ok"}
            />
          </div>

          {noMain && (
            <p className="rounded-card border border-amber-600/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
              Nobody is bringing a main yet. Desserts and drinks are not dinner.
            </p>
          )}

          {detail.dietary_notes && (
            <div className="rounded-card border border-edge bg-surface-raised px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                Allergies and diets
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-content-muted">
                {detail.dietary_notes}
              </p>
            </div>
          )}
          {detail.kitchen_notes && (
            <div className="rounded-card border border-edge bg-surface-raised px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-content-subtle">
                Kitchen
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-content-muted">
                {detail.kitchen_notes}
              </p>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
