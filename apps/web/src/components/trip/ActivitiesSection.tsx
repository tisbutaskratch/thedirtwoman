import { useEffect, useState, type FormEvent } from "react";
import { createActivity, listActivities } from "@/api/trips";
import type { Activity } from "@/api/types";

export default function ActivitiesSection({
  tripId,
  onChange,
}: {
  tripId: number;
  onChange?: () => void;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("");
  const [dayIndex, setDayIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listActivities(tripId).then(setActivities);
  }

  useEffect(refresh, [tripId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createActivity(tripId, { title, day_index: dayIndex });
      setTitle("");
      refresh();
      onChange?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Timeline</h2>
      <ul className="flex flex-col gap-2">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-center justify-between rounded-md border border-slate-800 px-4 py-2"
          >
            <span>
              <span className="mr-2 text-xs uppercase tracking-widest text-slate-500">
                Day {activity.day_index}
              </span>
              {activity.title}
            </span>
          </li>
        ))}
        {activities.length === 0 && <p className="text-sm text-slate-500">No activities yet.</p>}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          min={0}
          value={dayIndex}
          onChange={(e) => setDayIndex(Number(e.target.value))}
          className="w-20 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <input
          type="text"
          placeholder="Activity title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
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
