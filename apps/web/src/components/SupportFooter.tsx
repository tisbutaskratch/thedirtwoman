import { useState } from "react";
import { Link } from "react-router-dom";
import Critter from "@/art/critters";
import { Icon } from "@/components/ui";
import { AUTHOR, CREATED, DONATION_URL, FEEDBACK_URL, SHARE_TEXT } from "@/lib/support";

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
      {/*
       * The standard site-footer shape: the ask and its links on one side,
       * the byline pushed to the far end. Stacking them cost three rows for
       * what is, in the end, a footnote. On a phone there is no room for two
       * ends, so it stacks and centres.
       */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-5 text-center sm:flex-row sm:justify-between sm:gap-6 sm:px-6 sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <p className="flex items-center gap-2 text-sm text-content-muted">
            {/* The one spot of colour down here, and it hoards things for
                later, which is roughly the ask. */}
            <Critter
              name="squirrel"
              size={24}
              className="text-amber-500 opacity-100 dark:text-amber-400"
            />
            <span>Enjoying Adventure Planner?</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 transition-colors hover:underline"
            >
              <Icon name="support" size={15} />
              Leave a tip on Venmo
            </a>

            <a
              href={FEEDBACK_URL}
              className="inline-flex items-center gap-1.5 text-sm text-content-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              <Icon name="feedback" size={15} />
              Send feedback
            </a>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-sm text-content-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              <Icon name={shared ? "confirm" : "tellAFriend"} size={15} />
              {shared ? "Link copied. Thank you!" : "Tell your friends"}
            </button>
          </div>
        </div>

        {/* The byline is also the way back to the resume: someone who finds
            the app first should be able to find out who wrote it. */}
        <p className="shrink-0 text-xs text-content-subtle">
          Built by{" "}
          <Link to="/" className="font-medium text-content-muted underline-offset-4 hover:text-accent hover:underline">
            {AUTHOR}
          </Link>{" "}
          · {CREATED}
        </p>
      </div>
    </footer>
  );
}
