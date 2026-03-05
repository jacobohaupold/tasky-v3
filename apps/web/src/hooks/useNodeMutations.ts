/**
 * useNodeMutations — All node mutation hooks with optimistic updates.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { nodeKeys } from "./useNodeTree";
import type { Node, TreeNode } from "@/services/nodes.service";
import {
  createNode as svcCreate,
  updateNode as svcUpdate,
  moveNode as svcMove,
  duplicateNode as svcDuplicate,
  trashNode as svcTrash,
  restoreNode as svcRestore,
  permanentlyDeleteNode as svcPermanentDelete,
  toggleFavorite as svcToggleFavorite,
  buildTree,
} from "@/services/nodes.service";

type NodeData = { flat: Node[]; tree: TreeNode[] };

// ── useCreateNode ─────────────────────────────────────────────────────────────

export function useCreateNode() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";
  const qk = nodeKeys.all(workspaceId);

  return useMutation({
    mutationFn: (opts: {
      type: string;
      title?: string;
      parent_id?: string | null;
      icon?: string;
    }) =>
      svcCreate({
        userId: user!.id,
        workspaceId,
        ...opts,
      }),
    onMutate: async (opts) => {
      await queryClient.cancelQueries({ queryKey: qk });
      const prev = queryClient.getQueryData<NodeData>(qk);

      // Optimistic insert
      const tempNode: Node = {
        id: `temp-${Date.now()}`,
        workspace_id: workspaceId,
        parent_id: opts.parent_id ?? null,
        type: opts.type,
        title: opts.title ?? "Sin título",
        icon: opts.icon ?? null,
        cover_url: null,
        position: Date.now(),
        is_favorite: false,
        is_locked: false,
        archived_at: null,
        deleted_at: null,
        deleted_by: null,
        created_by: user!.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<NodeData>(qk, (old) => {
        if (!old) return old;
        const updated = [...old.flat, tempNode];
        return { flat: updated, tree: buildTree(updated) };
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk, ctx.prev);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk });
    },
  });
}

// ── useUpdateNode ─────────────────────────────────────────────────────────────

export function useUpdateNode() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";
  const qk = nodeKeys.all(workspaceId);

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof svcUpdate>[1];
    }) => svcUpdate(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: qk });
      const prev = queryClient.getQueryData<NodeData>(qk);

      queryClient.setQueryData<NodeData>(qk, (old) => {
        if (!old) return old;
        const updated = old.flat.map((n) =>
          n.id === id ? { ...n, ...data } : n
        );
        return { flat: updated, tree: buildTree(updated) };
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk, ctx.prev);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk });
    },
  });
}

// ── useMoveNode ───────────────────────────────────────────────────────────────

export function useMoveNode() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";
  const qk = nodeKeys.all(workspaceId);

  return useMutation({
    mutationFn: (opts: Parameters<typeof svcMove>[0]) => svcMove(opts),
    onMutate: async (opts) => {
      await queryClient.cancelQueries({ queryKey: qk });
      const prev = queryClient.getQueryData<NodeData>(qk);

      queryClient.setQueryData<NodeData>(qk, (old) => {
        if (!old) return old;
        const updated = old.flat.map((n) =>
          n.id === opts.nodeId
            ? { ...n, parent_id: opts.targetParentId }
            : n
        );
        return { flat: updated, tree: buildTree(updated) };
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk, ctx.prev);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk });
    },
  });
}

// ── useDuplicateNode ──────────────────────────────────────────────────────────

export function useDuplicateNode() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";

  return useMutation({
    mutationFn: (nodeId: string) => svcDuplicate(nodeId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: nodeKeys.all(workspaceId) });
    },
  });
}

// ── useTrashNode ──────────────────────────────────────────────────────────────

export function useTrashNode() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";
  const qk = nodeKeys.all(workspaceId);

  return useMutation({
    mutationFn: (nodeId: string) => svcTrash(nodeId, user!.id),
    onMutate: async (nodeId) => {
      await queryClient.cancelQueries({ queryKey: qk });
      const prev = queryClient.getQueryData<NodeData>(qk);

      // Optimistic remove from tree
      queryClient.setQueryData<NodeData>(qk, (old) => {
        if (!old) return old;
        const updated = old.flat.filter((n) => n.id !== nodeId);
        return { flat: updated, tree: buildTree(updated) };
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk, ctx.prev);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk });
      void queryClient.invalidateQueries({ queryKey: nodeKeys.trash(workspaceId) });
    },
  });
}

// ── useRestoreNode ────────────────────────────────────────────────────────────

export function useRestoreNode() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";

  return useMutation({
    mutationFn: async (nodeId: string) => {
      // Get all nodes (including deleted) for restore logic
      const { data } = await import("../lib/supabase").then((m) =>
        m.supabase
          .from("nodes")
          .select("*")
          .eq("workspace_id", workspaceId)
      );
      await svcRestore(nodeId, (data ?? []) as Node[]);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: nodeKeys.all(workspaceId) });
      void queryClient.invalidateQueries({ queryKey: nodeKeys.trash(workspaceId) });
    },
  });
}

// ── usePermanentlyDeleteNode ──────────────────────────────────────────────────

export function usePermanentlyDeleteNode() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";

  return useMutation({
    mutationFn: (nodeId: string) => svcPermanentDelete(nodeId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: nodeKeys.trash(workspaceId) });
    },
  });
}

// ── useToggleFavorite ─────────────────────────────────────────────────────────

export function useToggleFavorite() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id ?? "";
  const qk = nodeKeys.all(workspaceId);

  return useMutation({
    mutationFn: ({ id, isFav }: { id: string; isFav: boolean }) =>
      svcToggleFavorite(id, isFav),
    onMutate: async ({ id, isFav }) => {
      await queryClient.cancelQueries({ queryKey: qk });
      const prev = queryClient.getQueryData<NodeData>(qk);

      queryClient.setQueryData<NodeData>(qk, (old) => {
        if (!old) return old;
        const updated = old.flat.map((n) =>
          n.id === id ? { ...n, is_favorite: !isFav } : n
        );
        return { flat: updated, tree: buildTree(updated) };
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk, ctx.prev);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk });
    },
  });
}
