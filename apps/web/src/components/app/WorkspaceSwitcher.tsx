import { Plus, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/Dropdown";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function WorkspaceSwitcher() {
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-surface-2 mx-2" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-2",
            "text-left transition-colors hover:bg-surface-2",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          )}
        >
          {/* Workspace icon */}
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-accent text-white text-xs font-bold">
            {currentWorkspace.icon ?? currentWorkspace.name.charAt(0).toUpperCase()}
          </span>
          <span className="flex-1 min-w-0 text-sm font-medium text-text truncate">
            {currentWorkspace.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-muted stroke-[1.5]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => switchWorkspace(ws.id)}
            icon={
              <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-accent text-xs font-bold">
                {ws.icon ?? ws.name.charAt(0).toUpperCase()}
              </span>
            }
          >
            <span className="flex-1 truncate">{ws.name}</span>
            {ws.id === currentWorkspace.id && (
              <Check className="h-4 w-4 text-accent ml-auto flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Plus className="h-4 w-4" />}>
          Crear workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
