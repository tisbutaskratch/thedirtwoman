import { describe, expect, it, vi } from "vitest";
import { getHealth } from "./client";

describe("getHealth", () => {
  it("resolves with the health payload on a 200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok" }),
      }),
    );

    await expect(getHealth()).resolves.toEqual({ status: "ok" });
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(getHealth()).rejects.toThrow("Health check failed: 500");
  });
});
