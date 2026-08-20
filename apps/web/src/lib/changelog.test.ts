import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { APP_VERSION, RELEASES } from "@/lib/changelog";

/*
 * The changelog is only worth having if it is true. These check the things
 * that go wrong silently: a version that disagrees with the package, a
 * release added in the wrong place, or a duplicate left behind by a bad
 * merge. None of those would break a build, and all of them would make the
 * page lie.
 */
describe("changelog", () => {
  it("matches the version in package.json", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.version).toBe(APP_VERSION);
  });

  it("is ordered newest first", () => {
    const rank = (version: string) =>
      version.split(".").map(Number).reduce((acc, part) => acc * 1000 + part, 0);

    const ranks = RELEASES.map((release) => rank(release.version));
    expect(ranks).toEqual([...ranks].sort((a, b) => b - a));
  });

  it("has no duplicate versions", () => {
    const versions = RELEASES.map((release) => release.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it("uses semantic versions", () => {
    for (const release of RELEASES) {
      expect(release.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it("gives every release something to say", () => {
    for (const release of RELEASES) {
      expect(release.changes.length).toBeGreaterThan(0);
      expect(release.date).toBeTruthy();
    }
  });
});
