import { clearAuthState, getAuthState, setAuthState } from "@/lib/authStore";

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function rawRequest(path: string, options: RequestInit, accessToken: string | null) {
  const headers = new Headers(options.headers);
  // FormData bodies need the browser to set their own multipart boundary;
  // setting Content-Type ourselves would drop it and break the upload.
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getAuthState();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearAuthState();
        return null;
      }
      const data = await res.json();
      setAuthState({ accessToken: data.access_token });
      return data.access_token as string;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { accessToken } = getAuthState();
  let response = await rawRequest(path, options, accessToken);

  if (response.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await rawRequest(path, options, newToken);
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body?.detail === "string" ? body.detail : `Request failed: ${response.status}`;
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/**
 * Like apiRequest, but for endpoints that return a file rather than JSON.
 *
 * Shares the same token handling and refresh-on-401 retry; the only
 * difference is what comes back, so the auth logic is not duplicated.
 */
export async function apiRequestBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const { accessToken } = getAuthState();
  let response = await rawRequest(path, options, accessToken);

  if (response.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await rawRequest(path, options, newToken);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.status}`);
  }
  return response.blob();
}
