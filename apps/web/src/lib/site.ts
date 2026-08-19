/*
 * Which of the two products this build is.
 *
 * One codebase, one design system, two deployed sites. The resume lives on
 * a personal domain and Adventure Planner on its own, so the planner can be
 * branded, marketed, and one day charged for without any of that landing on
 * a personal name. The split is a build-time flag rather than a runtime
 * hostname check so each site ships only its own routes: the resume bundle
 * carries no planner code, and the planner bundle carries no resume.
 *
 * Set VITE_SITE per Netlify site. Anything other than "planner" builds the
 * resume, so a missing variable fails to the safer of the two.
 */
export type SiteKind = "resume" | "planner";

export const SITE: SiteKind = import.meta.env.VITE_SITE === "planner" ? "planner" : "resume";

export const isPlanner = SITE === "planner";
export const isResume = SITE === "resume";

/*
 * Each site links to the other, so each build needs the other's absolute
 * URL. In development both products are served by one dev server, so these
 * fall back to same-origin paths and the cross-links keep working locally.
 */
const RESUME_ORIGIN = import.meta.env.VITE_RESUME_URL ?? "";
const PLANNER_ORIGIN = import.meta.env.VITE_PLANNER_URL ?? "";

/**
 * Where the resume's "Adventure Planner" links point.
 *
 * The front door, not the dashboard. Sending someone from a resume straight
 * to /dashboard bounces them to a login form, which is the exact thing the
 * landing page exists to avoid.
 */
export const plannerUrl = (path = "/") => {
  const suffix = path === "/" ? "" : path;
  return PLANNER_ORIGIN ? `${PLANNER_ORIGIN}${suffix}` : `/app${suffix}`;
};

/** Where the planner's byline links back to. */
export const resumeUrl = (path = "/") => (RESUME_ORIGIN ? `${RESUME_ORIGIN}${path}` : path);

/*
 * Planner paths. On its own domain the planner sits at the root, so these
 * are plain paths; in the combined dev build they keep the /app prefix that
 * lets both products share one origin.
 */
const PREFIX = isPlanner ? "" : "/app";

export const routes = {
  dashboard: `${PREFIX}/dashboard`,
  newTrip: `${PREFIX}/trips/new`,
  trip: (tripId: number | string) => `${PREFIX}/trips/${tripId}`,
} as const;
