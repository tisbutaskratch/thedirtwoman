import { useState } from "react";
import Critter from "@/art/critters";
import { Icon } from "@/components/ui";
import { DONATION_URL, FEEDBACK_URL, SHARE_TEXT } from "@/lib/support";

/*
 * The "if you like this, chip in / pass it on" footer.
 *
 * Deliberately dull placement. The conventions worth following for a
 * donation ask are mostly about restraint:
 *
 *  - it lives in the footer, below the content, and never interrupts. No
 *    modal, no toast, no timed nag, nothing gated behind paying.
 *  - it asks once per page and stays the same size whether you've given or
 *    not, because the alternative is pestering people who already did.
 *  - the wording is plain and optional ("if"), not guilt-shaped. Guilt
 *    converts worse and reads badly on something people use on a trip.
 *  - a heart rather than a dollar sign: a dollar sign reads as a price or a
 *    paywall, which this isn't. Sponsor buttons across the ecosystem settled
 *    on a heart for exactly that reason.
 *  - the outbound link is rel="noopener noreferrer" and marked as leaving
 *    the app, so nobody is surprised by where they land.
 *
 * Note on "leave a review": there is deliberately no review button. A web
 * app has nowhere to review yet, and once there is a store listing the
 * prompt must go through Apple's SKStoreReviewController or Google's
 * In-App Review API — both platforms rate-limit those and reject custom
 * buttons that link straight to a review form. So the ask here is feedback
 * by email, which is the honest version of the same request today.
 */
export default function SupportFooter() {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    const url = window.location.origin;

    // The native sheet is the right affordance on a phone — it offers the
    // apps people actually message their friends in. Desktop browsers mostly
    // lack it, so those fall back to copying the link.
    if (navigator.share) {
      try {
        await navigator.share({ title: "Adventure Planner", text: SHARE_TEXT, url });
        return;
      } catch {
        // Cancelling the sheet lands here; treat it as a no-op.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      // Clipboard can be blocked; better to do nothing than to throw.
    }
  }

  return (
    <footer className="mt-auto border-t border-edge print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-center sm:gap-6 sm:px-6">
        <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm text-content-muted">
          {/* The bee gets its own amber rather than the muted footer grey —
              it's the one spot of colour down here, so it may as well be
              worth looking at. */}
          <Critter name="bee" size={22} className="text-amber-400 opacity-100" />
          <span>Enjoying Adventure Planner?</span>
          <a
            href={DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent underline-offset-2 transition-colors hover:underline"
          >
            <Icon name="support" size={14} />
            Leave a tip on Venmo
          </a>
        </p>

        <span aria-hidden className="hidden text-content-subtle sm:inline">
          ·
        </span>

        <a
          href={FEEDBACK_URL}
          className="inline-flex items-center gap-1.5 text-sm text-content-muted underline-offset-2 transition-colors hover:text-accent hover:underline"
        >
          <Icon name="feedback" size={14} />
          Send feedback
        </a>

        <span aria-hidden className="hidden text-content-subtle sm:inline">
          ·
        </span>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-sm text-content-muted underline-offset-2 transition-colors hover:text-accent hover:underline"
        >
          <Icon name={shared ? "confirm" : "tellAFriend"} size={14} />
          {shared ? "Link copied — thank you!" : "Tell your friends"}
        </button>
      </div>
    </footer>
  );
}
