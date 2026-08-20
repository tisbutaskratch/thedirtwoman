import { apiRequest } from "@/api/client";

export type CalendarRecipients = "me" | "everyone";

export interface CalendarEmailResult {
  sent: number;
  failed: number;
  recipients: string[];
}

/**
 * Email the trip's calendar file.
 *
 * Takes an audience rather than an address on purpose: the API will only
 * send to people already on the trip, so this cannot be used to send mail
 * from the app's domain to a stranger.
 */
export const emailTripCalendar = (tripId: number, to: CalendarRecipients) =>
  apiRequest<CalendarEmailResult>(`/trips/${tripId}/calendar/email`, {
    method: "POST",
    body: JSON.stringify({ to }),
  });
