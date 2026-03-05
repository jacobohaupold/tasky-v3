import { useLocation, useParams, NavLink } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Share2, MoreHorizontal,
  LayoutList, Kanban, Grid3x3, Calendar, List, GanttChart,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useNodes } from "@/hooks/useNodes";

interface TopBarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const VIEW_CHIPS = [
  { id: "table",    label: "Tabla",     icon: <LayoutList className="h-3.5 w-3.5" /> },
  { id: "board",    label: "Tablero",   icon: <Kanban className="h-3.5 w-3.5" /> },
  { id: "gallery",  label: "Galería",   icon: <Grid3x3 className="h-3.5 w-3.5" /> },
  { id: "calendar", label: "Calendario",icon: <Calendar className="h-3.5 w-3.5" /> },
  { id: "list",     label: "Lista",     icon: <List className="h-3.5 w-3.5" /> },
  { id: "timeline", label: "Línea",     icon: <GanttChart className="h-3.5 w-3.5" /> },
];

function Breadcrumbs() {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { flatNodes } = useNodes();

  const buildCrumbs = () => {
    const crumbs: { id?: string; label: string; to: string }[] = [
      { label: "Inicio", to: "/app" },
    ];

    if (location.pathname.startsWith("/app/page/") && id) {
      // Build ancestor chain
      const chain: typeof crumbs = [];
      let current = flatNodes.find((n) => n.id === id);
      while (current) {
        chain.unshift({
          id: current.id,
          label: current.title || "Sin título",
          to: `/app/page/${current.id}`,
        });
        const parentId = current.parent_id;
        current = parentId ? flatNodes.find((n) => n.id === parentId) : undefined;
      }
      crumbs.push(...chain);
    } else if (location.pathname.startsWith("/app/calendar")) {
      crumbs.push({ label: "Calendario", to: "/app/calendar" });
    } else if (location.pathname.startsWith("/app/trash")) {
      crumbs.push({ label: "Papelera", to: "/app/trash" });
    } else if (location.pathname.startsWith("/app/notifications")) {
      crumbs.push({ label: "Notificaciones", to: "/app/notifications" });
    } else if (location.pathname.startsWith("/app/settings")) {
      crumbs.push({ label: "Ajustes", to: "/app/settings" });
    } else if (location.pathname.startsWith("/app/search")) {
      crumbs.push({ label: "Búsqueda", to: "/app/search" });
    }

    return crumbs;
  };

  const crumbs = buildCrumbs();

  return (
    <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.to} className="flex items-center gap-1 min-w-0">
          {idx > 0 && (
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted stroke-[1.5]" />
          )}
          {idx === crumbs.length - 1 ? (
            <span className="font-medium text-text truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <NavLink
              to={crumb.to}
              className="text-muted hover:text-text transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </NavLink>
          )}
        </span>
      ))}
    </nav>
  );
}

export function TopBar({ sidebarCollapsed, onToggleSidebar }: TopBarProps) {
  const location = useLocation();
  const isDatabase = location.pathname.startsWith("/app/page/");
  // For now, show view chips only on database pages (could check node type)
  const showViewChips = false; // Will be enabled when page type = database

  return (
    <header className="flex h-12 flex-shrink-0 items-center border-b border-border bg-surface-1 px-4 gap-3">
      {/* Sidebar toggle */}
      <Tooltip content={sidebarCollapsed ? "Mostrar sidebar (⌘B)" : "Ocultar sidebar (⌘B)"} side="bottom">
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-surface-2 hover:text-text transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 stroke-[1.5]" />
          ) : (
            <PanelLeftClose className="h-4 w-4 stroke-[1.5]" />
          )}
        </button>
      </Tooltip>

      {/* Browser nav */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => window.history.back()}
          className="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-surface-2 hover:text-text transition-colors"
          aria-label="Atrás"
        >
          <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-surface-2 hover:text-text transition-colors"
          aria-label="Adelante"
        >
          <ChevronRight className="h-4 w-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* View chips for collections */}
      {showViewChips && isDatabase && (
        <div className="flex items-center gap-0.5 border border-border rounded-[var(--radius-sm)] p-0.5">
          {VIEW_CHIPS.map((view) => (
            <button
              key={view.id}
              className={cn(
                "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
                "text-muted hover:text-text hover:bg-surface-2"
              )}
              title={view.label}
            >
              {view.icon}
              <span className="hidden md:inline">{view.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isDatabase && (
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<Share2 className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Compartir</span>
            </Button>
            <Button variant="icon" size="sm" icon={<MoreHorizontal className="h-4 w-4" />} aria-label="Más opciones" />
          </>
        )}
      </div>
    </header>
  );
}
