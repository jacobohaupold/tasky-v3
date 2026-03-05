import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { Database } from "@/types/database";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export default function NotificationsPage() {
  const { user } = useAuth();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
  });

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="h-6 w-6 text-muted" />
        <h1 className="text-2xl font-bold text-text font-[var(--font-heading)]">
          Notificaciones
        </h1>
        {notifications.some((n) => !n.read_at) && (
          <button
            onClick={() => void markAllRead()}
            className="ml-auto text-sm text-accent hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[var(--radius-md)] bg-surface-2" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-10 w-10" />}
          title="Sin notificaciones"
          description="Aquí aparecerán tus notificaciones cuando las tengas."
        />
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex gap-3 rounded-[var(--radius-md)] border border-border px-4 py-3",
                "transition-colors",
                n.read_at
                  ? "bg-surface-1 hover:bg-surface-2"
                  : "bg-accent/5 border-accent/20 hover:bg-accent/10"
              )}
            >
              {!n.read_at && (
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{n.title}</p>
                <p className="text-xs text-muted mt-0.5">{n.body}</p>
                <p className="text-xs text-muted/60 mt-1">
                  {new Date(n.created_at).toLocaleString("es-ES")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
