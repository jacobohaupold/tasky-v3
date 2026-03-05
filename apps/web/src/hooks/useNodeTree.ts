/**
 * useNodeTree — Main hook for the node tree with Realtime sync.
 * Subscribes to Supabase Realtime on the workspace channel so that
 * changes from other users appear immediately without full refetch.
 */

import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { buildTree, getNodeTree } from "@/services/nodes.service";
import type { Node, TreeNode } from "@/services/nodes.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/providers/AuthProvider";

// ── Query key factory ─────────────────────────────────────────────────────────
export const nodeKeys = {
  all: (workspaceId: string) => ["nodes", workspaceId] as const,
  tree: (workspaceId: string) => ["nodes", workspaceId, "tree"] as const,
  trash: (workspaceId: string) => ["nodes", workspaceId, "trash"] as const,
  node: (id: string) => ["node", id] as const,
};

// ── useNodeTree ───────────────────────────────────────────────────────────────

export function useNodeTree() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: nodeKeys.all(workspaceId ?? ""),
    enabled: !!workspaceId && !!user,
    queryFn: () => getNodeTree(workspaceId!),
    staleTime: 30_000, // 30s — Realtime handles live updates
  });

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!workspaceId) return;

    const channel = supabase
      .channel(`workspace-nodes:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "nodes",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            nodeKeys.all(workspaceId),
            (old: { flat: Node[]; tree: TreeNode[] } | undefined) => {
              if (!old) return old;

              let updated = [...old.flat];

              if (payload.eventType === "INSERT") {
                const newNode = payload.new as Node;
                if (!newNode.deleted_at) {
                  updated = [...updated, newNode];
                }
              } else if (payload.eventType === "UPDATE") {
                const updatedNode = payload.new as Node;
                const idx = updated.findIndex((n) => n.id === updatedNode.id);
                if (idx >= 0) {
                  if (updatedNode.deleted_at) {
                    // Node was trashed — remove from live tree
                    updated = updated.filter((n) => n.id !== updatedNode.id);
                  } else {
                    updated = [
                      ...updated.slice(0, idx),
                      updatedNode,
                      ...updated.slice(idx + 1),
                    ];
                  }
                } else if (!updatedNode.deleted_at) {
                  // Was in trash, now restored
                  updated = [...updated, updatedNode];
                }
              } else if (payload.eventType === "DELETE") {
                updated = updated.filter((n) => n.id !== payload.old.id);
              }

              return { flat: updated, tree: buildTree(updated) };
            }
          );

          // Also invalidate trash query
          void queryClient.invalidateQueries({
            queryKey: nodeKeys.trash(workspaceId),
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [workspaceId, queryClient]);

  return {
    tree: data?.tree ?? [],
    flatNodes: data?.flat ?? [],
    isLoading,
    error,
  };
}

// ── useNode ───────────────────────────────────────────────────────────────────

export function useNode(nodeId: string | undefined) {
  const { flatNodes } = useNodeTree();
  const node = flatNodes.find((n) => n.id === nodeId) ?? null;
  return { node };
}

// ── useTrashNodes ─────────────────────────────────────────────────────────────

export function useTrashNodes() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const workspaceId = currentWorkspace?.id;

  return useQuery({
    queryKey: nodeKeys.trash(workspaceId ?? ""),
    enabled: !!workspaceId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nodes")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });
      if (error) throw error;
      return data as Node[];
    },
  });
}

// ── Invalidation helper ───────────────────────────────────────────────────────

export function useInvalidateNodes() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: nodeKeys.all(workspaceId) });
    void queryClient.invalidateQueries({ queryKey: nodeKeys.trash(workspaceId) });
  }, [queryClient, workspaceId]);
}
