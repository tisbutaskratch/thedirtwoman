import { useEffect, useState, type FormEvent } from "react";
import { getCampingDetail, updateCampingDetail } from "@/modes/camping/api";
import type { CampingDetail } from "@/modes/camping/types";

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

const FIRE_RESTRICTION_OPTIONS = [
  { label: "Not checked yet", value: "" },
  { label: "Checked, no restrictions", value: "true" },
  { label: "Checked, restrictions in effect", value: "false" },
];

export default function CampingPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<CampingDetail | null>(null);
  const [reservationRef, setReservationRef] = useState("");
  const [fireRestrictionsChecked, setFireRestrictionsChecked] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCampingDetail(tripId).then((d) => {
      setDetail(d);
      setReservationRef(d.campground_reservation_ref ?? "");
      setFireRestrictionsChecked(
        d.fire_restrictions_checked === null ? "" : String(d.fire_restrictions_checked),
      );
    });
  }, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateCampingDetail(tripId, {
        campground_reservation_ref: reservationRef || null,
        fire_restrictions_checked:
          fireRestrictionsChecked === "" ? null : fireRestrictionsChecked === "true",
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
      <h2 className="text-xl font-semibold">🏕️ Camping details</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Campground reservation
          </label>
          <input
            type="text"
            value={reservationRef}
            onChange={(e) => setReservationRef(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Fire restrictions
          </label>
          <select
            value={fireRestrictionsChecked}
            onChange={(e) => setFireRestrictionsChecked(e.target.value)}
            className={inputClass}
          >
            {FIRE_RESTRICTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
