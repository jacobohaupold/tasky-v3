import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Folder, Database } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useNodes } from "@/hooks/useNodes";
import Fuse from "fuse.js";
import { useMemo } from "react";
import { cn } from "@/lib/cn";

const typeIcon: Record<string, React.ReactNode> = {
  page: <FileText className="h-4 w-4" />,
  folder: <Folder className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
};

export default function SearchPage() {
  const navigate = useNavigate();
  const { flatNodes } = useNodes();
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(flatNodes, {
        keys: [
          { name: "title", weight: 0.8 },
          { name: "type", weight: 0.2 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [flatNodes]
  );

  const results = useMemo(() => {
    if (!query.trim()) return flatNodes.slice(0, 20);
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, flatNodes]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-6 w-6 text-muted" />
        <h1 className="text-2xl font-bold text-text font-[var(--font-heading)]">Búsqueda</h1>
      </div>

      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar páginas, carpetas, bases de datos…"
        autoFocus
        className="mb-6"
      />

      {results.length === 0 ? (
        <p className="text-center text-muted py-8">
          Sin resultados para &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="space-y-1">
          {results.map((node) => (
            <button
              key={node.id}
              onClick={() => navigate(`/app/page/${node.id}`)}
              className={cn(
                "flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-border px-4 py-3",
                "bg-surface-1 hover:bg-surface-2 text-left transition-colors"
              )}
            >
              <span className="text-xl flex-shrink-0">{node.icon}</span>
              <span className="text-muted flex-shrink-0">
                {typeIcon[node.type] ?? typeIcon.page}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {node.title || "Sin título"}
                </p>
              </div>
              <span className="text-xs text-muted capitalize flex-shrink-0">{node.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
