import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  onCommandK?: () => void;      // Cmd+K  — Command palette
  onCommandN?: () => void;      // Cmd+N  — New page
  onCommandShiftN?: () => void; // Cmd+Shift+N — New folder
  onCommandB?: () => void;      // Cmd+B  — Toggle sidebar
  onCommandShiftL?: () => void; // Cmd+Shift+L — Toggle dark mode
}

export function useKeyboardShortcuts(config: ShortcutConfig) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === "k") {
        e.preventDefault();
        config.onCommandK?.();
        return;
      }
      if (meta && !e.shiftKey && e.key === "n") {
        e.preventDefault();
        config.onCommandN?.();
        return;
      }
      if (meta && e.shiftKey && e.key === "N") {
        e.preventDefault();
        config.onCommandShiftN?.();
        return;
      }
      if (meta && !e.shiftKey && e.key === "b") {
        e.preventDefault();
        config.onCommandB?.();
        return;
      }
      if (meta && e.shiftKey && (e.key === "L" || e.key === "l")) {
        e.preventDefault();
        config.onCommandShiftL?.();
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      config.onCommandK,
      config.onCommandN,
      config.onCommandShiftN,
      config.onCommandB,
      config.onCommandShiftL,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler]);
}
