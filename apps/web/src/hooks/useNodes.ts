import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { Database } from "@/types/database";

export type Node = Database["public"]["Tables"]["nodes"]["Row"];

export interface TreeNode extends Node {
  children: TreeNode[];
}

function buildTree(nodes: Node[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));

  nodes.forEach((n) => {
    const treeNode = map.get(n.id)!;
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  });

  const sort = (arr: TreeNode[]) => {
    arr.sort((a, b) => a.position - b.position);
    arr.forEach((n) => sort(n.children));
  };
  sort(roots);

  return roots;
}

export function useNodes() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = currentWorkspace?.id;

  const { data: flatNodes = [], isLoading } = useQuery({
    queryKey: ["nodes", workspaceId],
    enabled: !!workspaceId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nodes")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .is("deleted_at", null)
        .order("position");
      if (error) throw error;
      return data as Node[];
    },
  });

  const tree = buildTree(flatNodes);

  // ── Mutations ────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["nodes", workspaceId] });

  const createNode = useMutation({
    mutationFn: async (opts: {
      title?: string;
      type: string;
      parent_id?: string | null;
    }) => {
      const siblings = flatNodes.filter(
        (n) => n.parent_id === (opts.parent_id ?? null)
      );
      const maxPos = siblings.reduce(
        (m, n) => Math.max(m, n.position),
        0
      );
      const { data, error } = await supabase
        .from("nodes")
        .insert({
          workspace_id: workspaceId!,
          created_by: user!.id,
          type: opts.type,
          title: opts.title ?? "Sin título",
          parent_id: opts.parent_id ?? null,
          position: maxPos + 1000,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const renameNode = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("nodes")
        .update({ title })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const softDeleteNode = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("nodes")
        .update({ deleted_at: new Date().toISOString(), deleted_by: user!.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const restoreNode = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("nodes")
        .update({ deleted_at: null, deleted_by: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const moveNode = useMutation({
    mutationFn: async ({
      id,
      parent_id,
      position,
    }: {
      id: string;
      parent_id: string | null;
      position: number;
    }) => {
      const { error } = await supabase
        .from("nodes")
        .update({ parent_id, position })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFav }: { id: string; isFav: boolean }) => {
      const { error } = await supabase
        .from("nodes")
        .update({ is_favorite: !isFav })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deletePermanently = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    flatNodes,
    tree,
    isLoading,
    createNode,
    renameNode,
    softDeleteNode,
    restoreNode,
    moveNode,
    toggleFavorite,
    deletePermanently,
  };
}

// ── Trash nodes ───────────────────────────────────────────────────────────────
export function useTrashNodes() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useQuery({
    queryKey: ["trash-nodes", workspaceId],
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
