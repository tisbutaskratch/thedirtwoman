import { useEffect } from "react";

/**
 * Sets the browser tab title.
 *
 * One origin hosts two things: the resume site at the root and the planner
 * under /app. Without this they share whatever the HTML shell says, so a
 * recruiter with both open sees two identical tabs.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
