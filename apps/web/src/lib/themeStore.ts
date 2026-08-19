export type Theme = "dark" | "light";

const STORAGE_KEY = "adventure-planner:theme";

function loadInitialTheme(): Theme {
  // Light by default, on both sites. Anyone who has chosen keeps their
  // choice, so the check is for an explicit "dark" rather than for the
  // absence of "light": a first-time visitor has stored nothing and gets
  // light, and someone who picked dark last week still gets dark.
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
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
