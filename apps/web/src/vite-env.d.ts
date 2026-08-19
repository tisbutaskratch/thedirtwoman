/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Which product this build is: "planner" or, by default, the resume. */
  readonly VITE_SITE?: "resume" | "planner";
  /** Absolute origin of the resume site, for the planner's link back. */
  readonly VITE_RESUME_URL?: string;
  /** Absolute origin of the planner site, for the resume's link across. */
  readonly VITE_PLANNER_URL?: string;
  /** Base URL of the API. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
