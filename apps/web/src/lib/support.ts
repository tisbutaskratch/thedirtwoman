/*
 * Where the "support this app" links point.
 *
 * Kept in one file so swapping the placeholder for a real account is a
 * single edit and never a hunt through components.
 *
 * ⚠️ PLACEHOLDER — this is not a real Venmo account. Replace
 * DONATION_URL with the real profile link before this ships anywhere
 * public, or the ask sends people nowhere.
 */
export const DONATION_URL = "https://venmo.com/u/example-not-a-real-account";

/** True while the link above is still the stand-in. */
export const DONATION_URL_IS_PLACEHOLDER = DONATION_URL.includes("example-not-a-real-account");

/**
 * Where feedback lands.
 *
 * ⚠️ PLACEHOLDER — swap for a real inbox before this goes anywhere public.
 *
 * A mailto is the right tool while the app is small: no form to build, no
 * backend to maintain, no third-party service holding people's messages,
 * and the reply thread lands in an inbox that already exists. Worth
 * revisiting only once the volume justifies a real form.
 */
export const FEEDBACK_EMAIL = "hello@example-not-a-real-address.com";

export const FEEDBACK_URL =
  `mailto:${FEEDBACK_EMAIL}` +
  "?subject=" +
  encodeURIComponent("Adventure Planner feedback");

/**
 * Credit line.
 *
 * A byline and a year in the footer is the ordinary convention for a
 * personal project. It answers "who made this and is it still maintained?",
 * which is exactly what someone wonders before they trust an app with a
 * trip, or send money to it.
 */
export const AUTHOR = "Saba Wilhelm";
export const CREATED = "August 2026";

/** What gets shared when someone taps "tell a friend". */
export const SHARE_TEXT =
  "Adventure Planner: trip planning for motocamping, camping, overlanding, backpacking and travel.";
