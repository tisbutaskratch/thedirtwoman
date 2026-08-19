import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { routes } from "@/lib/site";

/*
 * The planner deploys twice: under /app in the combined development build,
 * and at the root of its own domain in production. Any link that hardcodes
 * /app therefore works in development and 404s in production, which is
 * exactly how it shipped once. A hardcoded path is invisible to the type
 * checker, so it needs a test to catch it.
 */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    return [path];
  });
}

describe("planner links", () => {
  it("never hardcodes the /app prefix outside the two places that own it", () => {
    // site.ts derives the prefix; router.tsx mounts the routes under it.
    const owners = ["lib/site.ts", "router.tsx"];
    const offenders = sourceFiles("src")
      .filter((f) => !owners.some((o) => f.endsWith(o)))
      .filter((f) => /["'`]\/app\//.test(readFileSync(f, "utf8")))
      .map((f) => f.replace(/^src\//, ""));

    expect(offenders, `use routes.* from lib/site.ts instead: ${offenders.join(", ")}`).toEqual([]);
  });

  it("builds planner paths without a prefix in a planner build", () => {
    // VITE_SITE is unset under test, so this is the combined-build shape.
    expect(routes.dashboard).toMatch(/\/dashboard$/);
    expect(routes.newTrip).toMatch(/\/trips\/new$/);
    expect(routes.trip(7)).toMatch(/\/trips\/7$/);
  });
});
