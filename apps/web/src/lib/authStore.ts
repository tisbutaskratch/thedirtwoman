export interface AuthUser {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}

const STORAGE_KEY = "adventure-planner:auth";
const EMPTY_STATE: AuthState = { accessToken: null, refreshToken: null, user: null };

function loadInitialState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {
    // corrupt storage, fall through to empty state
  }
  return EMPTY_STATE;
}

let state: AuthState = loadInitialState();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getAuthState(): AuthState {
  return state;
}

export function setAuthState(next: Partial<AuthState>) {
  state = { ...state, ...next };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  notify();
}

export function clearAuthState() {
  state = EMPTY_STATE;
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

export function subscribeAuthState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
