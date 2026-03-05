import { Trash2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useNodes, useTrashNodes } from "@/hooks/useNodes";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

export default function TrashPage() {
  const { data: trashNodes = [], isLoading } = useTrashNodes();
  const { restoreNode, deletePermanently } = useNodes();

  const handleRestore = async (id: string) => {
    try {
      await restoreNode.mutateAsync(id);
      toast.success("Página restaurada");
    } catch {
      toast.error("Error al restaurar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar permanentemente? Esta acción no se puede deshacer.")) return;
    try {
      await deletePermanently.mutateAsync(id);
      toast.success("Eliminado permanentemente");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Trash2 className="h-6 w-6 text-muted" />
        <h1 className="text-2xl font-bold text-text font-[var(--font-heading)]">Papelera</h1>
        {trashNodes.length > 0 && (
          <span className="ml-auto text-sm text-muted">{trashNodes.length} elementos</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-[var(--radius-md)] bg-surface-2" />
          ))}
        </div>
      ) : trashNodes.length === 0 ? (
        <EmptyState
          icon={<Trash2 className="h-10 w-10" />}
          title="La papelera está vacía"
          description="Los elementos eliminados aparecerán aquí."
        />
      ) : (
        <div className="space-y-1">
          {trashNodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface-1 px-4 py-3",
                "hover:bg-surface-2 transition-colors"
              )}
            >
              <span className="text-lg">{node.icon ?? "📄"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {node.title || "Sin título"}
                </p>
                <p className="text-xs text-muted">
                  Eliminado{" "}
                  {node.deleted_at
                    ? new Date(node.deleted_at).toLocaleDateString("es-ES")
                    : "—"}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="h-3.5 w-3.5" />}
                  onClick={() => void handleRestore(node.id)}
                  loading={restoreNode.isPending}
                >
                  Restaurar
                </Button>
                <Button
                  variant="icon"
                  size="sm"
                  icon={<X className="h-4 w-4" />}
                  onClick={() => void handleDelete(node.id)}
                  aria-label="Eliminar permanentemente"
                  className="text-muted hover:text-red-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
