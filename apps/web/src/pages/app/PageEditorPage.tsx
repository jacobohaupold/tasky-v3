import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, FileText } from "lucide-react";
import { useNodes } from "@/hooks/useNodes";
import { useRecentViews } from "@/hooks/useRecentViews";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function PageEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { flatNodes, isLoading, renameNode } = useNodes();
  const { recordView } = useRecentViews();
  const didRecord = useRef(false);

  const node = flatNodes.find((n) => n.id === id);

  const [title, setTitle] = useState(node?.title ?? "");

  // Sync title when node loads
  useEffect(() => {
    if (node) setTitle(node.title);
  }, [node?.title, node]);

  // Record recent view
  useEffect(() => {
    if (id && !didRecord.current) {
      didRecord.current = true;
      void recordView(id);
    }
  }, [id, recordView]);

  const handleTitleBlur = () => {
    if (node && title !== node.title) {
      renameNode.mutate({ id: node.id, title });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="Página no encontrada"
          description="Esta página no existe o fue eliminada."
          action={{ label: "Ir al inicio", onClick: () => navigate("/app") }}
        />
      </div>
    );
  }

  if (node.deleted_at) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="Página en papelera"
          description="Esta página fue movida a la papelera."
          action={{ label: "Ver papelera", onClick: () => navigate("/app/trash") }}
          secondaryAction={{ label: "Ir al inicio", onClick: () => navigate("/app") }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Cover placeholder */}
      {node.cover_url && (
        <div
          className="w-full h-48 rounded-[var(--radius-lg)] mb-8 bg-cover bg-center"
          style={{ backgroundImage: `url(${node.cover_url})` }}
        />
      )}

      {/* Icon + Title */}
      <div className="mb-8">
        {node.icon && (
          <div className="text-5xl mb-4 select-none">{node.icon}</div>
        )}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Sin título"
          className="w-full text-4xl font-bold text-text bg-transparent border-none outline-none placeholder:text-muted/40 font-[var(--font-heading)] resize-none"
        />
      </div>

      {/* Editor placeholder */}
      <div className="text-muted text-sm border border-dashed border-border rounded-[var(--radius-md)] p-8 text-center">
        <p className="mb-2">El editor de bloques llegará en el siguiente prompt.</p>
        <p className="text-xs">Tipo de nodo: <code className="bg-surface-2 px-1 rounded">{node.type}</code></p>
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/app")}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
