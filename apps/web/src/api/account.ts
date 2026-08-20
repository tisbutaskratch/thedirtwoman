import { apiRequest } from "@/api/client";

export type SharedTripAction = "keep" | "delete";

export interface AccountDeleteSummary {
  trips_deleted: number;
  trips_left_with_collaborators: number;
  trips_scheduled: number;
  journal_entries_deleted: number;
}

/**
 * Delete the signed-in account.
 *
 * `confirm` must be the account's own email address. The API checks it
 * rather than trusting the dialog, so a client bug cannot delete an account
 * that nobody typed the address of.
 */
export const deleteAccount = (sharedTrips: SharedTripAction, confirm: string) =>
  apiRequest<AccountDeleteSummary>("/auth/me", {
    method: "DELETE",
    body: JSON.stringify({ shared_trips: sharedTrips, confirm }),
  });
