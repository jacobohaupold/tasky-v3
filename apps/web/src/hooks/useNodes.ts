/**
 * useNodes — Backward-compatible façade over the new service layer.
 * Existing components can keep importing from here.
 */

export {
  useNodeTree,
  useTrashNodes,
  useNode,
  useInvalidateNodes,
  nodeKeys,
} from "./useNodeTree";

export {
  useCreateNode,
  useUpdateNode,
  useMoveNode,
  useDuplicateNode,
  useTrashNode,
  useRestoreNode,
  usePermanentlyDeleteNode,
  useToggleFavorite,
} from "./useNodeMutations";

// Re-export types
export type { Node, TreeNode } from "@/services/nodes.service";

// ── Backward-compatible combined hook ────────────────────────────────────────
import { useNodeTree } from "./useNodeTree";
import {
  useCreateNode,
  useUpdateNode,
  useMoveNode,
  useTrashNode,
  useToggleFavorite,
} from "./useNodeMutations";
import type { Node as NodeType } from "@/services/nodes.service";

/**
 * @deprecated Use individual hooks (useNodeTree, useCreateNode, etc.) instead.
 * Kept for backward compatibility.
 */
export function useNodes() {
  const { tree, flatNodes, isLoading } = useNodeTree();
  const createNode = useCreateNode();
  const updateNode = useUpdateNode();
  const trashNode = useTrashNode();
  const moveNodeMutation = useMoveNode();
  const toggleFavoriteMutation = useToggleFavorite();

  return {
    tree,
    flatNodes,
    isLoading,
    createNode,
    // Legacy shape: renameNode.mutateAsync({ id, title })
    renameNode: {
      mutate: (vars: { id: string; title: string }) =>
        updateNode.mutate({ id: vars.id, data: { title: vars.title } }),
      mutateAsync: (vars: { id: string; title: string }) =>
        updateNode.mutateAsync({ id: vars.id, data: { title: vars.title } }),
      isPending: updateNode.isPending,
    },
    // Legacy shape: softDeleteNode.mutateAsync(id)
    softDeleteNode: trashNode,
    // Legacy shape: moveNode.mutateAsync({ id, parent_id, position })
    moveNode: {
      mutate: (vars: { id: string; parent_id: string | null; position?: number }) =>
        moveNodeMutation.mutate({
          nodeId: vars.id,
          targetParentId: vars.parent_id,
          allNodes: flatNodes,
        }),
      mutateAsync: (vars: { id: string; parent_id: string | null; position?: number }) =>
        moveNodeMutation.mutateAsync({
          nodeId: vars.id,
          targetParentId: vars.parent_id,
          allNodes: flatNodes as NodeType[],
        }),
      isPending: moveNodeMutation.isPending,
    },
    toggleFavorite: toggleFavoriteMutation,
  };
}
