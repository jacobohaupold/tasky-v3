import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { IconRail } from "@/components/app/IconRail";
import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";
import { CommandPalette, useCommandPalette } from "@/components/ui/CommandPalette";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useNodes } from "@/hooks/useNodes";
import type { CommandItem } from "@/components/ui/CommandPalette";
import { FileText, Folder, Database } from "lucide-react";

// ── Inner layout (needs WorkspaceContext) ─────────────────────────────────────
function AppShell() {
  const cmd = useCommandPalette();
  const { toggle: toggleDark } = useDarkMode();
  const navigate = useNavigate();

  const {
    sidebarWidth,
    collapsed,
    updateWidth,
    toggleCollapsed,
  } = useSidebarState();

  const { flatNodes, createNode } = useNodes();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Build command palette items from nodes
  const nodeItems: CommandItem[] = flatNodes.slice(0, 20).map((n) => ({
    id: n.id,
    label: n.title || "Sin título",
    group: "pages" as const,
    icon: n.type === "folder"
      ? <Folder className="h-4 w-4" />
      : n.type === "database"
      ? <Database className="h-4 w-4" />
      : <FileText className="h-4 w-4" />,
    onSelect: () => navigate(`/app/page/${n.id}`),
    keywords: [n.type],
  }));

  const paletteItems: CommandItem[] = [
    {
      id: "new-page",
      label: "Nueva página",
      description: "Crea una página en blanco",
      group: "actions",
      shortcut: "N",
      onSelect: () => {
        createNode.mutate({ type: "page" }, {
          onSuccess: (node) => navigate(`/app/page/${node.id}`),
        });
      },
    },
    {
      id: "new-folder",
      label: "Nueva carpeta",
      group: "actions",
      onSelect: () => createNode.mutate({ type: "folder" }),
    },
    {
      id: "toggle-dark",
      label: "Cambiar tema",
      description: "Alterna entre modo claro y oscuro",
      group: "actions",
      shortcut: "⌘⇧L",
      onSelect: toggleDark,
    },
    {
      id: "go-settings",
      label: "Ajustes",
      group: "pages",
      onSelect: () => navigate("/app/settings"),
    },
    {
      id: "go-trash",
      label: "Papelera",
      group: "pages",
      onSelect: () => navigate("/app/trash"),
    },
    ...nodeItems,
  ];

  useKeyboardShortcuts({
    onCommandK: () => cmd.setOpen((v) => !v),
    onCommandN: () => {
      createNode.mutate({ type: "page" }, {
        onSuccess: (node) => navigate(`/app/page/${node.id}`),
      });
    },
    onCommandShiftN: () => createNode.mutate({ type: "folder" }),
    onCommandB: toggleCollapsed,
    onCommandShiftL: toggleDark,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* ── Icon Rail ──────────────────────────────────────────────────── */}
      <IconRail onSearchOpen={() => cmd.setOpen(true)} />

      {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
      {!collapsed && (
        <div className="hidden md:flex flex-shrink-0">
          <Sidebar
            width={sidebarWidth}
            collapsed={false}
            onWidthChange={updateWidth}
            onSearchOpen={() => cmd.setOpen(true)}
          />
        </div>
      )}

      {/* ── Sidebar (mobile drawer) ────────────────────────────────────── */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 flex shadow-xl">
            <Sidebar
              width={280}
              collapsed={false}
              onWidthChange={() => {}}
              onSearchOpen={() => {
                cmd.setOpen(true);
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ── Main Canvas ────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <TopBar
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-bg">
          <Outlet />
        </main>
      </div>

      {/* ── Command Palette ────────────────────────────────────────────── */}
      <CommandPalette
        open={cmd.open}
        onClose={cmd.close}
        items={paletteItems}
      />
    </div>
  );
}

// ── Export (wrapped with WorkspaceProvider) ───────────────────────────────────
export default function AppLayout() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}

// ── Placeholder page kept for App.tsx ─────────────────────────────────────────
export function AppHomePage() {
  return null; // Replaced by pages/app/HomePage.tsx via routing
}
