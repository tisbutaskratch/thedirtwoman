import { useSyncExternalStore } from "react";
import { getTheme, subscribeTheme, toggleTheme } from "@/lib/themeStore";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getTheme);

  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-md border border-edge px-2.5 py-1.5 text-sm transition-colors hover:border-edge-strong"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
