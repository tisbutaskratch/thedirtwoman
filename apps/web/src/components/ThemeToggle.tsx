import { useSyncExternalStore } from "react";
import { IconButton } from "@/components/ui";
import { getTheme, subscribeTheme, toggleTheme } from "@/lib/themeStore";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getTheme);

  return (
    <IconButton
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      icon={theme === "dark" ? "light" : "dark"}
    />
  );
}
