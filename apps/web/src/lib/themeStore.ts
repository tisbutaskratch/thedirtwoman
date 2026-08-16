export type Theme = "dark" | "light";

const STORAGE_KEY = "adventure-planner:theme";

function loadInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

let theme: Theme = loadInitialTheme();
const listeners = new Set<() => void>();

function applyToDocument(next: Theme) {
  if (next === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

applyToDocument(theme);

export function getTheme(): Theme {
  return theme;
}

export function setTheme(next: Theme) {
  theme = next;
  localStorage.setItem(STORAGE_KEY, next);
  applyToDocument(next);
  listeners.forEach((listener) => listener());
}

export function toggleTheme() {
  setTheme(theme === "dark" ? "light" : "dark");
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
