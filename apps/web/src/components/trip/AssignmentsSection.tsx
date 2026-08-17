import { useEffect, useMemo, useState } from "react";
import { listCollaborators } from "@/api/sharing";
import { listTasks } from "@/api/tasks";
import { listActivities, listGear } from "@/api/trips";
import type { Activity, Collaborator, Gear, Task } from "@/api/types";
import { Badge, EmptyHint, EmptyState, Section } from "@/components/ui";
import { ALL_ASSIGNEE } from "@/lib/assignment";
import { SECTION_META } from "@/lib/tripTypes";

/** One thing somebody has to do or bring, flattened out of its own section. */
interface Item {
  source: "packing" | "prep" | "timeline";
  label: string;
  detail?: string;
  done: boolean;
}

const SOURCE_META: Record<
  Item["source"],
  { label: string; glyph: string; tone: "violet" | "amber" | "emerald" }
> = {
  packing: { label: "Packing", glyph: SECTION_META.packing.glyph, tone: "violet" },
  prep: { label: "Prep", glyph: SECTION_META.tasks.glyph, tone: "amber" },
  timeline: { label: "Timeline", glyph: SECTION_META.timeline.glyph, tone: "emerald" },
};

/** Buckets that aren't a real person, kept in a fixed order after the roster. */
const EVERYONE = "everyone";
const NOBODY = "nobody";

function parseTodos(raw: string | null) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy plain-text rows carry no assignee, so they land in "nobody".
    return raw
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ text, done: false, assignedTo: null }));
  }
  return [];
}

export default function AssignmentsSection({ tripId }: { tripId: number }) {
  const [roster, setRoster] = useState<Collaborator[]>([]);
  const [gear, setGear] = useState<Gear[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    listCollaborators(tripId).then(setRoster);
    listGear(tripId).then(setGear);
    listTasks(tripId).then(setTasks);
    listActivities(tripId).then(setActivities);
  }, [tripId]);

  /*
   * Everything assigned anywhere on the trip, keyed by who owns it. The point
   * of this section is that no one should have to open five other sections to
   * find out what they personally still have to do.
   */
  const byAssignee = useMemo(() => {
    const buckets = new Map<string, Item[]>();
    const push = (key: string | number | null, item: Item) => {
      const k = key === null ? NOBODY : String(key);
      buckets.set(k, [...(buckets.get(k) ?? []), item]);
    };

    for (const g of gear) {
      push(g.assigned_to_all ? EVERYONE : g.assigned_to_user_id, {
        source: "packing",
        label: g.name,
        detail: g.category ?? undefined,
        done: g.packed,
      });
    }

    for (const t of tasks) {
      push(t.assigned_to_all ? EVERYONE : t.assigned_to_user_id, {
        source: "prep",
        label: t.title,
        detail: t.due_date ? `due ${t.due_date}` : undefined,
        done: t.done,
      });
    }

    for (const a of activities) {
      for (const todo of parseTodos(a.todos)) {
        push(todo.assignedTo === ALL_ASSIGNEE ? EVERYONE : (todo.assignedTo ?? null), {
          source: "timeline",
          label: todo.text,
          detail: `day ${a.day_index}`,
          done: !!todo.done,
        });
      }
    }
    return buckets;
  }, [gear, tasks, activities]);

  // Real people first (roster order), then the two catch-all buckets.
  const columns = [
    ...roster.map((c) => ({ key: String(c.user_id), name: c.name, kind: "person" as const })),
    { key: EVERYONE, name: "Everyone", kind: "all" as const },
    { key: NOBODY, name: "Unclaimed", kind: "none" as const },
  ].filter((col) => col.kind === "person" || (byAssignee.get(col.key)?.length ?? 0) > 0);

  const total = Array.from(byAssignee.values()).reduce((n, items) => n + items.length, 0);

  return (
    <Section
      glyph="🧾"
      title="Who's doing what"
      tone="sky"
      count={total}
    >
      {total === 0 ? (
        <EmptyState
          glyph="🧾"
          message="Nothing assigned yet. Claim items in the packing list, prep checklist or timeline."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {columns.map((col) => {
            const items = byAssignee.get(col.key) ?? [];
            const open = items.filter((i) => !i.done).length;
            return (
              <div
                key={col.key}
                className={`flex flex-col gap-2 rounded-card border p-3 ${
                  col.kind === "none"
                    ? "border-dashed border-edge bg-transparent"
                    : "border-edge bg-surface-raised"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <h3 className="truncate text-sm font-semibold text-content">{col.name}</h3>
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-content-subtle">
                    {open} open
                  </span>
                </div>

                {items.length === 0 ? (
                  <EmptyHint>Nothing assigned</EmptyHint>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {items.map((item, i) => {
                      const meta = SOURCE_META[item.source];
                      return (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 rounded-sm px-1 py-0.5 text-xs odd:bg-surface-overlay/50"
                        >
                          <span
                            title={meta.label}
                            className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                              item.source === "packing"
                                ? "bg-violet-400"
                                : item.source === "prep"
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                            }`}
                          />
                          <span
                            className={`min-w-0 flex-1 ${
                              item.done ? "text-content-subtle line-through" : "text-content-muted"
                            }`}
                          >
                            {item.label}
                            {item.detail && (
                              <span className="ml-1 text-content-subtle">({item.detail})</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend for the coloured dots — cheaper than repeating a label per row. */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SOURCE_META) as Item["source"][]).map((source) => (
            <Badge key={source} tone={SOURCE_META[source].tone}>
              {SOURCE_META[source].label}
            </Badge>
          ))}
        </div>
      )}
    </Section>
  );
}
