/*
 * Where the "support this app" links point.
 *
 * Kept in one file so swapping the placeholder for a real account is a
 * single edit and never a hunt through components.
 *
 */
export const DONATION_URL = "https://venmo.com/u/Saba-Dasadawala";

/**
 * Where feedback lands.
 *
 * A mailto is the right tool while the app is small: no form to build, no
 * backend to maintain, no third-party service holding people's messages,
 * and the reply thread lands in an inbox that already exists. Worth
 * revisiting only once the volume justifies a real form.
 */
export const FEEDBACK_EMAIL = "sababusiness@proton.me";

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
