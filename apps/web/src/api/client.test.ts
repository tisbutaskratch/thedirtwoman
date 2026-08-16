import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthState, getAuthState, setAuthState } from "@/lib/authStore";
import { apiRequest, ApiError, getHealth } from "./client";

function mockFetchOnce(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValueOnce(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  clearAuthState();
  localStorage.clear();
  vi.unstubAllGlobals();
});

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
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(getHealth()).rejects.toThrow("Health check failed: 500");
  });
});

describe("apiRequest", () => {
  it("attaches the access token and returns parsed JSON on success", async () => {
    setAuthState({ accessToken: "access-1", refreshToken: "refresh-1" });
    const fetchMock = mockFetchOnce({ ok: true, status: 200, json: async () => ({ id: 1 }) });

    const result = await apiRequest<{ id: number }>("/trips/1");

    expect(result).toEqual({ id: 1 });
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.headers.get("Authorization")).toBe("Bearer access-1");
  });

  it("returns undefined for a 204 No Content response without parsing JSON", async () => {
    setAuthState({ accessToken: "access-1" });
    const json = vi.fn();
    mockFetchOnce({ ok: true, status: 204, json });

    const result = await apiRequest("/trips/1");

    expect(result).toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("throws ApiError with the server's detail message on failure", async () => {
    setAuthState({ accessToken: "access-1" });
    mockFetchOnce({ ok: false, status: 404, json: async () => ({ detail: "Trip not found" }) });

    await expect(apiRequest("/trips/999")).rejects.toMatchObject(
      new ApiError(404, "Trip not found"),
    );
  });

  it("falls back to a generic message when the error body has no detail", async () => {
    setAuthState({ accessToken: "access-1" });
    mockFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    await expect(apiRequest("/trips/1")).rejects.toThrow("Request failed: 500");
  });

  it("does not attempt a refresh on 401 when there is no access token", async () => {
    const fetchMock = mockFetchOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Not authenticated" }),
    });

    await expect(apiRequest("/trips")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes the access token on 401 and retries the request once", async () => {
    setAuthState({ accessToken: "expired-token", refreshToken: "refresh-1" });

    const fetchMock = vi
      .fn()
      // original request: rejected as expired
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      // refresh call: succeeds with a new access token
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "new-token" }),
      })
      // retried request with the new token: succeeds
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 42 }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ id: number }>("/trips/1");

    expect(result).toEqual({ id: 42 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAuthState().accessToken).toBe("new-token");

    const retryHeaders = fetchMock.mock.calls[2][1].headers;
    expect(retryHeaders.get("Authorization")).toBe("Bearer new-token");
  });

  it("clears auth state and surfaces the original 401 when refresh itself fails", async () => {
    setAuthState({ accessToken: "expired-token", refreshToken: "bad-refresh" });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/trips/1")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAuthState()).toEqual({ accessToken: null, refreshToken: null, user: null });
  });

  it("dedupes concurrent 401s into a single refresh call", async () => {
    setAuthState({ accessToken: "expired-token", refreshToken: "refresh-1" });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) }) // request A
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) }) // request B
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "new-token" }),
      }) // shared refresh
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 1 }) }) // retry A
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 2 }) }); // retry B
    vi.stubGlobal("fetch", fetchMock);

    const [resultA, resultB] = await Promise.all([
      apiRequest<{ id: number }>("/trips/1"),
      apiRequest<{ id: number }>("/trips/2"),
    ]);

    expect(resultA).toEqual({ id: 1 });
    expect(resultB).toEqual({ id: 2 });
    // 2 original requests + 1 shared refresh + 2 retries = 5, not 6
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
});
