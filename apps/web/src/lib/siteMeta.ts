/*
 * The head of each site, as data.
 *
 * One index.html builds two products, so the title and the link preview have
 * to be written into it at build time. Doing it at runtime would fix the
 * browser tab and nothing else: Slack, iMessage, WhatsApp and every other
 * unfurler reads the raw HTML and never runs the JavaScript, so a title set
 * by React is invisible to all of them.
 *
 * Imported by vite.config.ts, so it must stay free of DOM and React.
 */

export interface SiteMeta {
  title: string;
  description: string;
  url: string;
}

export const RESUME_META: SiteMeta = {
  title: "Saba Wilhelm · Software Engineer",
  description:
    "Software engineer, ten years of production systems. Carrier integrations and logistics at Loop Returns, healthcare before that.",
  url: "https://sabawilhelm.com",
};

export const PLANNER_META: SiteMeta = {
  title: "The Dirt Hags Adventure Planner",
  description:
    "Plan the whole trip in one place. Six kinds of trip, each asking what that kind actually needs, with a timeline, a packing list that adds up, and everyone on the same plan. Free, no ads.",
  url: "https://thedirthags.com",
};

export const metaForSite = (site: string | undefined): SiteMeta =>
  site === "planner" ? PLANNER_META : RESUME_META;
