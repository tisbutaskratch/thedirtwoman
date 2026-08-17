/*
 * Assignee dropdowns.
 *
 * Three states, not two: nobody has claimed it, one named person owns it, or
 * it applies to everyone ("all bring a headlamp"). "All" is a separate flag
 * rather than a magic user id, so it can't collide with a real member.
 */

/** Sentinel `<option value>` for "everyone on this trip". */
export const ALL_ASSIGNEE = "all";

export interface Assignable {
  assigned_to_user_id: number | null;
  assigned_to_all: boolean;
}

/** Turn a `<select>` value into the two API fields it maps to. */
export function assignmentPayload(value: string): Assignable {
  return {
    assigned_to_user_id: value && value !== ALL_ASSIGNEE ? Number(value) : null,
    assigned_to_all: value === ALL_ASSIGNEE,
  };
}

/** The reverse: pick the `<select>` value that represents a record. */
export function assigneeValue(item: Assignable): string {
  if (item.assigned_to_all) return ALL_ASSIGNEE;
  return item.assigned_to_user_id?.toString() ?? "";
}

/** Label to show on the item once assigned, or null when nobody owns it. */
export function assigneeLabel(
  item: Assignable,
  nameByUserId: Map<number, string>,
): string | null {
  if (item.assigned_to_all) return "Everyone";
  if (item.assigned_to_user_id === null) return null;
  return nameByUserId.get(item.assigned_to_user_id) ?? "Someone";
}
