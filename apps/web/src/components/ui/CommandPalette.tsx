import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Search, FileText, Zap, Clock, LayoutTemplate, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { scaleIn, backdrop } from "@/lib/animations";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  group: "recent" | "pages" | "templates" | "actions";
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items?: CommandItem[];
}

const groupConfig = {
  recent:    { label: "Reciente",   icon: <Clock className="h-3.5 w-3.5" /> },
  pages:     { label: "Páginas",    icon: <FileText className="h-3.5 w-3.5" /> },
  templates: { label: "Templates",  icon: <LayoutTemplate className="h-3.5 w-3.5" /> },
  actions:   { label: "Acciones",   icon: <Zap className="h-3.5 w-3.5" /> },
};

const defaultItems: CommandItem[] = [
  {
    id: "new-page",
    label: "Nueva página",
    description: "Crea una página en blanco",
    group: "actions",
    icon: <FileText className="h-4 w-4" />,
    shortcut: "N",
    onSelect: () => {},
    keywords: ["crear", "nuevo", "página", "blank"],
  },
  {
    id: "search-pages",
    label: "Buscar páginas",
    description: "Encuentra cualquier página",
    group: "actions",
    icon: <Search className="h-4 w-4" />,
    shortcut: "F",
    onSelect: () => {},
    keywords: ["buscar", "encontrar", "search"],
  },
];

export function CommandPalette({
  open,
  onClose,
  items = defaultItems,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fuse.js instance
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "label", weight: 0.6 },
          { name: "description", weight: 0.3 },
          { name: "keywords", weight: 0.1 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [items]
  );

  // Filtered + grouped results
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, items]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [filtered]);

  // Flat ordered list for keyboard nav
  const flatItems = useMemo(
    () =>
      (["recent", "pages", "templates", "actions"] as const)
        .filter((g) => grouped[g])
        .flatMap((g) => grouped[g]),
    [grouped]
  );

  // Reset when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) return; // Let parent handle opening
      }
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        flatItems[activeIdx]?.onSelect();
        onClose();
      }
    },
    [flatItems, activeIdx, onClose]
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-active="true"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  let flatIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Paleta de comandos"
        >
          {/* Backdrop */}
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-xl rounded-[var(--radius-lg)] border border-border bg-surface-1 shadow-xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Search className="h-4 w-4 flex-shrink-0 text-muted stroke-[1.5]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                placeholder="Busca páginas, acciones, templates…"
                className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
                aria-autocomplete="list"
                aria-controls="cmd-list"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-muted hover:text-text"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-0.5 rounded bg-surface-2 px-1.5 py-0.5 text-2xs text-muted font-mono">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              id="cmd-list"
              role="listbox"
              className="max-h-80 overflow-y-auto py-2"
            >
              {flatItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted">
                  <Search className="mb-3 h-8 w-8 stroke-[1]" />
                  <p className="text-sm">Sin resultados para &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                (["recent", "pages", "templates", "actions"] as const)
                  .filter((g) => grouped[g]?.length)
                  .map((group) => (
                    <div key={group} className="mb-1">
                      {/* Group label */}
                      <div className="flex items-center gap-1.5 px-4 py-1.5 text-2xs font-medium uppercase tracking-wider text-muted">
                        <span className="text-muted/70">{groupConfig[group].icon}</span>
                        {groupConfig[group].label}
                      </div>

                      {/* Items */}
                      {grouped[group].map((item) => {
                        const isActive = flatIdx === activeIdx;
                        const currentIdx = flatIdx++;

                        return (
                          <button
                            key={item.id}
                            role="option"
                            aria-selected={isActive}
                            data-active={isActive}
                            onClick={() => {
                              item.onSelect();
                              onClose();
                            }}
                            onMouseEnter={() => setActiveIdx(currentIdx)}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              "focus:outline-none",
                              isActive
                                ? "bg-accent text-white"
                                : "hover:bg-surface-2 text-text"
                            )}
                          >
                            <span
                              className={cn(
                                "flex-shrink-0 [&>svg]:stroke-[1.5] [&>svg]:h-4 [&>svg]:w-4",
                                isActive ? "text-white/80" : "text-muted"
                              )}
                            >
                              {item.icon ?? <FileText className="h-4 w-4" />}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium truncate">
                                {item.label}
                              </span>
                              {item.description && (
                                <span
                                  className={cn(
                                    "block text-xs truncate",
                                    isActive ? "text-white/70" : "text-muted"
                                  )}
                                >
                                  {item.description}
                                </span>
                              )}
                            </span>
                            {item.shortcut && (
                              <kbd
                                className={cn(
                                  "hidden sm:block rounded px-1.5 py-0.5 text-2xs font-mono",
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-surface-2 text-muted"
                                )}
                              >
                                {item.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-border px-4 py-2.5 flex items-center gap-4 text-2xs text-muted">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">↑↓</kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">↵</kbd>
                Seleccionar
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">Esc</kbd>
                Cerrar
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Hook: global Cmd+K listener ───────────────────────────────────────────────
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen, close: () => setOpen(false) };
}
