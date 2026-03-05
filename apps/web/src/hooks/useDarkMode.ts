import { useEffect, useState } from "react";

const STORAGE_KEY = "tasky_dark_mode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEY, String(isDark));
  }, [isDark]);

  const toggle = () => setIsDark((v) => !v);

  return { isDark, toggle, setDark: setIsDark };
}
