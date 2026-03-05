import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, Star, Clock, LayoutTemplate,
  Trash2, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { PageTree } from "./PageTree";
import { useNodes } from "@/hooks/useNodes";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useRecentViews } from "@/hooks/useRecentViews";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "@/components/ui/Toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/Dropdown";

interface SidebarProps {
  width: number;
  collapsed: boolean;
  onWidthChange: (w: number) => void;
  onSearchOpen: () => void;
}

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group/details">
      <summary className="flex cursor-pointer list-none items-center gap-1 px-3 py-1 text-2xs font-medium uppercase tracking-wider text-muted hover:text-text select-none">
        <ChevronDown className="h-3 w-3 stroke-[2] transition-transform group-open/details:rotate-0 -rotate-90" />
        {title}
      </summary>
      <div className="mt-0.5">{children}</div>
    </details>
  );
}

export function Sidebar({
  width,
  collapsed,
  onWidthChange,
  onSearchOpen,
}: SidebarProps) {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { tree, flatNodes, isLoading, createNode, renameNode, softDeleteNode, moveNode, toggleFavorite } = useNodes();
  const { expandedIds, toggleExpanded } = useSidebarState();
  const { recentViews } = useRecentViews();

  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  // Resize handle drag
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = width;

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = ev.clientX - startX.current;
        onWidthChange(startW.current + delta);
      };
      const onUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [width, onWidthChange]
  );

  const handleCreateNode = useCallback(
    async (opts: { type: string; parent_id?: string | null }) => {
      try {
        const node = await createNode.mutateAsync(opts);
        if (opts.type === "page") {
          navigate(`/app/page/${node.id}`);
        }
      } catch {
        toast.error("Error al crear el nodo");
      }
    },
    [createNode, navigate]
  );

  const handleRenameNode = useCallback(
    async (id: string, title: string) => {
      try {
        await renameNode.mutateAsync({ id, title });
      } catch {
        toast.error("Error al renombrar");
      }
    },
    [renameNode]
  );

  const handleDeleteNode = useCallback(
    async (id: string) => {
      try {
        await softDeleteNode.mutateAsync(id);
        toast.success("Movido a papelera");
      } catch {
        toast.error("Error al eliminar");
      }
    },
    [softDeleteNode]
  );

  const handleMoveNode = useCallback(
    async (id: string, parent_id: string | null, position: number) => {
      try {
        await moveNode.mutateAsync({ id, parent_id, position });
      } catch {
        toast.error("Error al mover");
      }
    },
    [moveNode]
  );

  const handleToggleFavorite = useCallback(
    async (id: string, isFav: boolean) => {
      try {
        await toggleFavorite.mutateAsync({ id, isFav });
      } catch {
        toast.error("Error al actualizar favorito");
      }
    },
    [toggleFavorite]
  );

  const favoriteNodes = flatNodes.filter((n) => n.is_favorite);
  const trashCount = 0; // Could fetch separately

  if (collapsed) return null;

  return (
    <aside
      className="relative flex h-full flex-col bg-surface-1 border-r border-border overflow-hidden"
      style={{ width }}
      aria-label="Barra lateral"
    >
      {/* ── Top: workspace switcher ─────────────────────────────────────── */}
      <div className="flex-shrink-0 px-2 pt-3 pb-2">
        <WorkspaceSwitcher />
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-2 pb-2">
        <button
          onClick={onSearchOpen}
          className={cn(
            "flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2",
            "bg-surface-2 text-muted text-sm hover:bg-border/60 transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          )}
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0 stroke-[1.5]" />
          <span className="flex-1 text-left">Buscar…</span>
          <kbd className="hidden sm:flex text-2xs bg-surface-1 rounded px-1 py-0.5 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Quick create ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-2 pb-3 flex items-center gap-1">
        <span className="flex-1 text-xs font-medium text-muted px-1">
          {currentWorkspace?.name ?? "…"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-[var(--radius-xs)]",
                "text-muted hover:bg-surface-2 hover:text-text transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              )}
              aria-label="Crear nuevo"
            >
              <Plus className="h-4 w-4 stroke-[1.5]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => void handleCreateNode({ type: "page", parent_id: null })}
            >
              Nueva página
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void handleCreateNode({ type: "folder", parent_id: null })}
            >
              Nueva carpeta
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void handleCreateNode({ type: "database", parent_id: null })}
            >
              Nueva base de datos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/templates")}>
              Instalar template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 space-y-1 scrollbar-thin">

        {/* Favorites */}
        {favoriteNodes.length > 0 && (
          <SidebarSection title="Favoritos">
            {favoriteNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => navigate(`/app/page/${node.id}`)}
                className="flex w-full items-center gap-2 px-3 py-1 text-sm text-text hover:bg-surface-2 rounded-[var(--radius-xs)] transition-colors truncate"
              >
                <Star className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 fill-amber-400" />
                <span className="truncate">{node.title || "Sin título"}</span>
              </button>
            ))}
          </SidebarSection>
        )}

        {/* Recent */}
        {recentViews.length > 0 && (
          <SidebarSection title="Recientes" defaultOpen={false}>
            {recentViews.map((rv) => {
              const node = rv.node as { id: string; title: string; icon: string | null } | null;
              if (!node) return null;
              return (
                <button
                  key={rv.node_id}
                  onClick={() => navigate(`/app/page/${rv.node_id}`)}
                  className="flex w-full items-center gap-2 px-3 py-1 text-sm text-text hover:bg-surface-2 rounded-[var(--radius-xs)] transition-colors truncate"
                >
                  <Clock className="h-3.5 w-3.5 flex-shrink-0 text-muted" />
                  <span className="truncate">{node.title || "Sin título"}</span>
                </button>
              );
            })}
          </SidebarSection>
        )}

        {/* Page Tree */}
        <SidebarSection title="Páginas">
          {isLoading ? (
            <div className="px-3 py-2 space-y-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-5 w-full animate-pulse rounded bg-surface-2" />
              ))}
            </div>
          ) : (
            <PageTree
              nodes={tree}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpanded}
              onCreateNode={(opts) => void handleCreateNode(opts)}
              onRenameNode={(id, title) => void handleRenameNode(id, title)}
              onDeleteNode={(id) => void handleDeleteNode(id)}
              onMoveNode={(id, pid, pos) => void handleMoveNode(id, pid, pos)}
              onToggleFavorite={(id, isFav) => void handleToggleFavorite(id, isFav)}
            />
          )}
        </SidebarSection>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border px-2 py-2 flex items-center gap-1">
        <button
          onClick={() => navigate("/app/templates")}
          className="flex items-center gap-2 flex-1 px-2 py-1.5 text-xs text-muted hover:text-text hover:bg-surface-2 rounded-[var(--radius-xs)] transition-colors"
        >
          <LayoutTemplate className="h-3.5 w-3.5" />
          Templates
        </button>
        <button
          onClick={() => navigate("/app/trash")}
          className="flex items-center gap-2 flex-1 px-2 py-1.5 text-xs text-muted hover:text-text hover:bg-surface-2 rounded-[var(--radius-xs)] transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Papelera
          {trashCount > 0 && (
            <span className="ml-auto text-2xs bg-surface-2 px-1 rounded">{trashCount}</span>
          )}
        </button>
      </div>

      {/* ── Resize handle ───────────────────────────────────────────────── */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 transition-colors z-10"
        onMouseDown={handleResizeStart}
        aria-hidden="true"
      />
    </aside>
  );
}
