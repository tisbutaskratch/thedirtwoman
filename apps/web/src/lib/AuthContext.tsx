import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { loginUser, registerUser } from "@/api/auth";
import {
  clearAuthState,
  getAuthState,
  setAuthState,
  subscribeAuthState,
  type AuthUser,
} from "@/lib/authStore";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribeAuthState, getAuthState, getAuthState);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginUser({ email, password });
    setAuthState({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: tokens.user,
    });
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const tokens = await registerUser({ email, password, name });
    setAuthState({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: tokens.user,
    });
  }, []);

  const logout = useCallback(() => {
    clearAuthState();
  }, []);

  const value: AuthContextValue = {
    user: state.user,
    isAuthenticated: state.accessToken !== null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
