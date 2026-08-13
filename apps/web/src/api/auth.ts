import { apiRequest } from "@/api/client";
import type { AuthUser } from "@/lib/authStore";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

export const registerUser = (payload: { email: string; password: string; name: string }) =>
  apiRequest<TokenPair>("/auth/register", { method: "POST", body: JSON.stringify(payload) });

export const loginUser = (payload: { email: string; password: string }) =>
  apiRequest<TokenPair>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
