import { useNavigate } from "react-router-dom";
import { Plus, Star, Clock, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { useNodes } from "@/hooks/useNodes";
import { useRecentViews } from "@/hooks/useRecentViews";

export default function HomePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { flatNodes, createNode } = useNodes();
  const { recentViews } = useRecentViews();

  const favoriteNodes = flatNodes.filter((n) => n.is_favorite);
  const recentNodes = recentViews.slice(0, 6);

  const handleNewPage = () => {
    createNode.mutate({ type: "page" }, {
      onSuccess: (node) => navigate(`/app/page/${node.id}`),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text font-[var(--font-heading)]">
          Hola, {profile?.display_name?.split(" ")[0] ?? "👋"}
        </h1>
        <p className="text-muted mt-1">¿En qué trabajas hoy?</p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-10 flex-wrap">
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={handleNewPage}
          loading={createNode.isPending}
        >
          Nueva página
        </Button>
        <Button
          variant="secondary"
          icon={<LayoutTemplate className="h-4 w-4" />}
          onClick={() => navigate("/app/templates")}
        >
          Templates
        </Button>
      </div>

      {/* Recientes */}
      {recentNodes.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            <Clock className="h-4 w-4" /> Visitados recientemente
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentNodes.map((rv) => {
              const node = rv.node as { id: string; title: string; icon: string | null; type: string } | null;
              if (!node) return null;
              return (
                <Card
                  key={rv.node_id}
                  variant="interactive"
                  onClick={() => navigate(`/app/page/${rv.node_id}`)}
                  className="cursor-pointer"
                >
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{node.icon ?? "📄"}</span>
                      <span className="text-sm font-medium text-text truncate">
                        {node.title || "Sin título"}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Favoritos */}
      {favoriteNodes.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Favoritos
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteNodes.map((node) => (
              <Card
                key={node.id}
                variant="interactive"
                onClick={() => navigate(`/app/page/${node.id}`)}
                className="cursor-pointer"
              >
                <CardBody>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{node.icon ?? "📄"}</span>
                    <span className="text-sm font-medium text-text truncate">
                      {node.title || "Sin título"}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {flatNodes.length === 0 && (
        <EmptyState
          icon={<LayoutTemplate className="h-10 w-10" />}
          title="Tu workspace está vacío"
          description="Crea tu primera página o instala un template para empezar."
          action={{ label: "Crear página", onClick: handleNewPage }}
          secondaryAction={{
            label: "Ver templates",
            onClick: () => navigate("/app/templates"),
          }}
        />
      )}
    </div>
  );
}
