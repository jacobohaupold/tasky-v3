import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function useRecentViews() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const queryClient = useQueryClient();

  const { data: recentViews = [] } = useQuery({
    queryKey: ["recent-views", user?.id, workspaceId],
    enabled: !!user && !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recent_views")
        .select("*, node:nodes(id, title, icon, type, parent_id, deleted_at)")
        .eq("user_id", user!.id)
        .eq("workspace_id", workspaceId!)
        .order("viewed_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      // Filter out deleted nodes
      return (data ?? []).filter((rv) => {
        const node = rv.node as { deleted_at: string | null } | null;
        return node && !node.deleted_at;
      });
    },
  });

  const recordView = useCallback(
    async (nodeId: string) => {
      if (!user || !workspaceId) return;
      await supabase.from("recent_views").upsert(
        {
          user_id: user.id,
          node_id: nodeId,
          workspace_id: workspaceId,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,node_id" }
      );
      void queryClient.invalidateQueries({
        queryKey: ["recent-views", user.id, workspaceId],
      });
    },
    [user, workspaceId, queryClient]
  );

  return { recentViews, recordView };
}
