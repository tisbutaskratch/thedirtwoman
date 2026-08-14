import { useEffect, useState, type FormEvent } from "react";
import { getInternationalDetail, updateInternationalDetail } from "@/modes/international/api";
import type { InternationalDetail } from "@/modes/international/types";

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

function parseCurrencies(value: string): string[] {
  return value
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter((code) => code.length > 0);
}

export default function InternationalPanel({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [detail, setDetail] = useState<InternationalDetail | null>(null);
  const [homeCurrency, setHomeCurrency] = useState("");
  const [destinationCurrencies, setDestinationCurrencies] = useState("");
  const [primaryTimezone, setPrimaryTimezone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getInternationalDetail(tripId).then((d) => {
      setDetail(d);
      setHomeCurrency(d.home_currency ?? "");
      setDestinationCurrencies((d.destination_currencies ?? []).join(", "));
      setPrimaryTimezone(d.primary_timezone ?? "");
    });
  }, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const currencies = parseCurrencies(destinationCurrencies);
      const updated = await updateInternationalDetail(tripId, {
        home_currency: homeCurrency || null,
        destination_currencies: currencies.length > 0 ? currencies : null,
        primary_timezone: primaryTimezone || null,
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
      <h2 className="text-xl font-semibold">✈️ International details</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Home currency
          </label>
          <input
            type="text"
            placeholder="USD"
            maxLength={3}
            value={homeCurrency}
            onChange={(e) => setHomeCurrency(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Primary timezone
          </label>
          <input
            type="text"
            placeholder="Europe/Paris"
            value={primaryTimezone}
            onChange={(e) => setPrimaryTimezone(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Destination currencies (comma-separated)
          </label>
          <input
            type="text"
            placeholder="EUR, GBP, CHF"
            value={destinationCurrencies}
            onChange={(e) => setDestinationCurrencies(e.target.value)}
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
