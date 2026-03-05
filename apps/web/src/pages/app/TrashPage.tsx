import { useState, useMemo } from "react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { es } from "date-fns/locale";
import {
  Trash2, RotateCcw, X, FileText, Folder,
  Database, AlertTriangle, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Chip } from "@/components/ui/Chip";
import { useTrashNodes } from "@/hooks/useNodeTree";
import { useRestoreNode, usePermanentlyDeleteNode } from "@/hooks/useNodeMutations";
import { toast } from "@/components/ui/Toast";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQueryClient } from "@tanstack/react-query";
import { nodeKeys } from "@/hooks/useNodeTree";
import { cn } from "@/lib/cn";
import type { Node } from "@/services/nodes.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

const typeIcons: Record<string, React.ReactNode> = {
  page: <FileText className="h-4 w-4" />,
  folder: <Folder className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
};

function groupByDate(nodes: Node[]): { label: string; items: Node[] }[] {
  const groups: Map<string, Node[]> = new Map();

  nodes.forEach((n) => {
    if (!n.deleted_at) return;
    const d = new Date(n.deleted_at);
    let label: string;
    if (isToday(d)) label = "Hoy";
    else if (isYesterday(d)) label = "Ayer";
    else if (isThisWeek(d)) label = "Esta semana";
    else label = format(d, "MMMM yyyy", { locale: es });

    const group = groups.get(label) ?? [];
    group.push(n);
    groups.set(label, group);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}

// ── TrashNode card ────────────────────────────────────────────────────────────

interface TrashNodeCardProps {
  node: Node;
  allNodes: Node[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  restoring: boolean;
  deleting: boolean;
}

function TrashNodeCard({
  node,
  allNodes,
  onRestore,
  onDelete,
  restoring,
  deleting,
}: TrashNodeCardProps) {
  // Build path string (from parent chain, even if parents are also deleted)
  const buildPath = (): string => {
    const parts: string[] = [];
    let current = node;
    let depth = 0;
    while (current.parent_id && depth < 5) {
      const parent = allNodes.find((n) => n.id === current.parent_id);
      if (!parent) break;
      parts.unshift(parent.title || "Sin título");
      current = parent;
      depth++;
    }
    return parts.join(" / ");
  };

  const path = buildPath();

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-[var(--radius-md)] border border-border",
        "bg-surface-1 px-4 py-3 hover:bg-surface-2 transition-colors"
      )}
    >
      {/* Type icon */}
      <span className="flex-shrink-0 text-muted">
        {node.icon ? (
          <span className="text-lg">{node.icon}</span>
        ) : (
          typeIcons[node.type] ?? typeIcons.page
        )}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">
          {node.title || "Sin título"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {path && (
            <span className="text-xs text-muted truncate max-w-[200px]">
              {path}
            </span>
          )}
          <span className="text-xs text-muted/60 flex-shrink-0">
            {node.deleted_at &&
              format(new Date(node.deleted_at), "d MMM, HH:mm", { locale: es })}
          </span>
          <Chip variant="default" className="text-2xs py-0 px-1.5 flex-shrink-0 capitalize">
            {node.type}
          </Chip>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          onClick={() => onRestore(node.id)}
          loading={restoring}
          className="text-accent"
        >
          Restaurar
        </Button>
        <Button
          variant="icon"
          size="sm"
          icon={<X className="h-4 w-4" />}
          onClick={() => onDelete(node.id)}
          loading={deleting}
          aria-label="Eliminar permanentemente"
          className="text-muted hover:text-red-500"
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type FilterType = "all" | "page" | "folder" | "database";

export default function TrashPage() {
  const { isAdmin } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const { data: trashNodes = [], isLoading } = useTrashNodes();
  const restoreMutation = useRestoreNode();
  const deleteMutation = usePermanentlyDeleteNode();

  const [filter, setFilter] = useState<FilterType>("all");
  const [emptyingTrash, setEmptyingTrash] = useState(false);

  // All nodes (including deleted) for path building
  const allNodes = trashNodes;

  const filteredNodes = useMemo(() => {
    if (filter === "all") return trashNodes;
    return trashNodes.filter((n) => n.type === filter);
  }, [trashNodes, filter]);

  const groups = useMemo(() => groupByDate(filteredNodes), [filteredNodes]);

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success("Página restaurada");
    } catch {
      toast.error("Error al restaurar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar permanentemente? Esta acción no se puede deshacer."))
      return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Eliminado permanentemente");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleEmptyTrash = async () => {
    if (
      !confirm(
        `¿Vaciar la papelera? Se eliminarán ${trashNodes.length} elementos permanentemente. Esta acción no se puede deshacer.`
      )
    )
      return;

    setEmptyingTrash(true);
    try {
      const { error } = await supabase
        .from("nodes")
        .delete()
        .eq("workspace_id", currentWorkspace!.id)
        .not("deleted_at", "is", null);

      if (error) throw error;

      void queryClient.invalidateQueries({
        queryKey: nodeKeys.trash(currentWorkspace!.id),
      });
      toast.success("Papelera vaciada");
    } catch {
      toast.error("Error al vaciar la papelera");
    } finally {
      setEmptyingTrash(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Trash2 className="h-6 w-6 text-muted" />
        <h1 className="text-2xl font-bold text-text font-[var(--font-heading)]">
          Papelera
        </h1>
        {trashNodes.length > 0 && (
          <span className="ml-1 text-sm text-muted">
            ({trashNodes.length})
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && trashNodes.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => void handleEmptyTrash()}
              loading={emptyingTrash}
            >
              Vaciar papelera
            </Button>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 px-4 py-3 mb-6">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Los elementos en la papelera se eliminan automáticamente después de 30 días.
        </p>
      </div>

      {/* Filter chips */}
      {trashNodes.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-3.5 w-3.5 text-muted flex-shrink-0" />
          {(["all", "page", "folder", "database"] as FilterType[]).map(
            (type) => {
              const count =
                type === "all"
                  ? trashNodes.length
                  : trashNodes.filter((n) => n.type === type).length;
              if (type !== "all" && count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    filter === type
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-muted hover:bg-border hover:text-text"
                  )}
                >
                  {type === "all"
                    ? "Todos"
                    : type === "page"
                    ? "Páginas"
                    : type === "folder"
                    ? "Carpetas"
                    : "Bases de datos"}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0 text-2xs font-bold",
                      filter === type ? "bg-white/20" : "bg-surface-1"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-[var(--radius-md)] bg-surface-2"
            />
          ))}
        </div>
      ) : filteredNodes.length === 0 ? (
        <EmptyState
          icon={<Trash2 className="h-10 w-10" />}
          title={
            filter === "all" ? "La papelera está vacía" : "Sin elementos de este tipo"
          }
          description={
            filter === "all"
              ? "Los elementos eliminados aparecerán aquí durante 30 días."
              : "No hay elementos de este tipo en la papelera."
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <section key={label}>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">
                {label}
              </h2>
              <div className="space-y-1">
                {items.map((node) => (
                  <TrashNodeCard
                    key={node.id}
                    node={node}
                    allNodes={allNodes}
                    onRestore={(id) => void handleRestore(id)}
                    onDelete={(id) => void handleDelete(id)}
                    restoring={
                      restoreMutation.isPending &&
                      restoreMutation.variables === node.id
                    }
                    deleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables === node.id
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
