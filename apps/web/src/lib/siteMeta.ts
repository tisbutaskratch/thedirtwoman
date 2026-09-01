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
  /** Inline SVG for the browser tab. See FAVICONS below. */
  favicon: string;
  /** Colours the browser chrome on Android and the title bar on iOS. */
  themeColor: string;
}

/*
 * Tab icons, drawn rather than downloaded.
 *
 * Inline SVG data URIs, so there is no file to serve, nothing to 404, and
 * one shape that stays sharp from the 16px tab to the 180px home-screen
 * icon. Both are drawn on a 32px grid and deliberately kept to two shapes:
 * anything with more detail turns to porridge at tab size, which is the
 * only size most people will ever see it at.
 *
 * The green is the accent from index.css, converted to a literal because
 * an SVG in a data URI cannot read CSS custom properties.
 */
const ACCENT = "#007434";
const CREAM = "#fcf6eb";

/*
 * The planner: a mountain inside a calendar.
 *
 * Two ideas, because one alone says the wrong thing. A mountain by itself
 * is any outdoors app, and at tab size it is the glyph browsers already use
 * for a broken image. A calendar by itself is any scheduling tool. Together
 * they say the actual thing: planning, outdoors.
 *
 * The calendar carries the planning half because this app is genuinely
 * date-driven, with a day-by-day timeline and calendar export, and because
 * the two tabs on top are recognisable at sixteen pixels where a clipboard
 * clip is not.
 *
 * Earlier attempts that did not survive tab size, so nobody repeats them: a
 * compass needle read as an arrow, a bare four-pointed star read as an AI
 * button, a tyre tread read as a rifle scope, and every version that laid a
 * tick over a mountain turned into a squiggle.
 */
const PLANNER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${ACCENT}"/>
  <rect x="4.5" y="7" width="23" height="21" rx="3" fill="none" stroke="${CREAM}" stroke-width="2.4"/>
  <path d="M11 4.5v5M21 4.5v5" stroke="${CREAM}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M10 24 L16 15 L22 24 Z" fill="${CREAM}"/>
</svg>`;

/*
 * The resume: a single initial. Two letters are unreadable in a tab, and a
 * personal site does not need a logo so much as something recognisable in a
 * row of twenty pinned tabs.
 */
const RESUME_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${ACCENT}"/>
  <text x="16" y="23" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="21" font-weight="700" fill="${CREAM}">S</text>
</svg>`;

/** A data URI a browser will accept in a link tag. */
export const asDataUri = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;

export const RESUME_META: SiteMeta = {
  title: "Saba Wilhelm · Software Engineer",
  description:
    "Software engineer, ten years of production systems. Carrier integrations and logistics at Loop Returns, healthcare before that.",
  url: "https://sabawilhelm.com",
  favicon: asDataUri(RESUME_ICON),
  themeColor: ACCENT,
};

export const PLANNER_META: SiteMeta = {
  title: "The Dirt Hags Adventure Planner",
  description:
    "Plan the whole trip in one place. Six kinds of trip, each asking what that kind actually needs, with a timeline, a packing list that adds up, and everyone on the same plan. Free, no ads.",
  url: "https://thedirthags.com",
  favicon: asDataUri(PLANNER_ICON),
  themeColor: ACCENT,
};

export const metaForSite = (site: string | undefined): SiteMeta =>
  site === "planner" ? PLANNER_META : RESUME_META;
