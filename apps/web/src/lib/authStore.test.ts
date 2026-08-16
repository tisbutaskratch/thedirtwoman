import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthState, getAuthState, setAuthState, subscribeAuthState } from "./authStore";

const STORAGE_KEY = "adventure-planner:auth";

beforeEach(() => {
  clearAuthState();
  localStorage.clear();
});

describe("authStore", () => {
  it("starts with an empty state", () => {
    expect(getAuthState()).toEqual({ accessToken: null, refreshToken: null, user: null });
  });

  it("setAuthState merges partial updates and persists to localStorage", () => {
    setAuthState({ accessToken: "abc123" });

    expect(getAuthState().accessToken).toBe("abc123");
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.accessToken).toBe("abc123");
  });

  it("setAuthState preserves fields not included in the update", () => {
    setAuthState({ accessToken: "abc123", refreshToken: "refresh1" });
    setAuthState({ accessToken: "abc456" });

    expect(getAuthState()).toMatchObject({ accessToken: "abc456", refreshToken: "refresh1" });
  });

  it("clearAuthState resets to empty and removes from localStorage", () => {
    setAuthState({ accessToken: "abc123" });
    clearAuthState();

    expect(getAuthState()).toEqual({ accessToken: null, refreshToken: null, user: null });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("notifies subscribers on every state change until unsubscribed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAuthState(listener);

    setAuthState({ accessToken: "abc123" });
    expect(listener).toHaveBeenCalledTimes(1);

    clearAuthState();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setAuthState({ accessToken: "xyz789" });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
