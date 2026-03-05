/**
 * nodes.service.ts — Business logic layer for all node (page/folder) operations.
 * Uses the Supabase client + service_role Edge Functions for privileged operations.
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type Node = Database["public"]["Tables"]["nodes"]["Row"];
export type NodeInsert = Database["public"]["Tables"]["nodes"]["Insert"];
export type Block = Database["public"]["Tables"]["blocks"]["Row"];

export interface TreeNode extends Node {
  children: TreeNode[];
}

// ── Fractional indexing ───────────────────────────────────────────────────────

export function calculatePosition(
  prevPos?: number,
  nextPos?: number
): number {
  if (prevPos === undefined && nextPos === undefined) return 1000;
  if (prevPos === undefined) return (nextPos! - 1000 > 0 ? nextPos! - 1000 : nextPos! / 2);
  if (nextPos === undefined) return prevPos + 1000;
  const mid = (prevPos + nextPos) / 2;
  // If gap is too small, signal caller to renormalize
  return mid;
}

async function getMaxPosition(
  workspaceId: string,
  parentId: string | null
): Promise<number> {
  const query = supabase
    .from("nodes")
    .select("position")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("position", { ascending: false })
    .limit(1);

  if (parentId) {
    query.eq("parent_id", parentId);
  } else {
    query.is("parent_id", null);
  }

  const { data } = await query;
  return data?.[0]?.position ?? 0;
}

// ── Build tree from flat list ─────────────────────────────────────────────────

export function buildTree(nodes: Node[]): TreeNode[] {
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

// ── Cycle detection ───────────────────────────────────────────────────────────

export function isDescendant(
  nodeId: string,
  potentialAncestorId: string,
  allNodes: Node[]
): boolean {
  // Check if potentialAncestorId is an ancestor of nodeId
  // i.e., would moving nodeId under potentialAncestorId create a cycle?
  // We need to check if potentialAncestorId is a descendant of nodeId
  const descendants = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = allNodes.filter(
      (n) => n.parent_id === current && !n.deleted_at
    );
    children.forEach((c) => {
      if (!descendants.has(c.id)) {
        descendants.add(c.id);
        queue.push(c.id);
      }
    });
  }
  return descendants.has(potentialAncestorId);
}

// ── createNode ───────────────────────────────────────────────────────────────

export async function createNode(opts: {
  userId: string;
  workspaceId: string;
  type: string;
  title?: string;
  parent_id?: string | null;
  icon?: string;
}): Promise<Node> {
  const maxPos = await getMaxPosition(opts.workspaceId, opts.parent_id ?? null);
  const position = maxPos + 1000;

  const { data: node, error } = await supabase
    .from("nodes")
    .insert({
      workspace_id: opts.workspaceId,
      created_by: opts.userId,
      type: opts.type,
      title: opts.title ?? "Sin título",
      parent_id: opts.parent_id ?? null,
      position,
      icon: opts.icon ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Create an initial empty paragraph block for page nodes
  if (opts.type === "page") {
    await supabase.from("blocks").insert({
      node_id: node.id,
      created_by: opts.userId,
      type: "paragraph",
      props: {},
      position: 1000,
    });
  }

  return node;
}

// ── updateNode ───────────────────────────────────────────────────────────────

export async function updateNode(
  id: string,
  data: Partial<Pick<Node, "title" | "icon" | "cover_url" | "is_locked">>
): Promise<Node> {
  const { data: node, error } = await supabase
    .from("nodes")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return node;
}

// ── moveNode ─────────────────────────────────────────────────────────────────

export async function moveNode(opts: {
  nodeId: string;
  targetParentId: string | null;
  allNodes: Node[];
  beforeNodeId?: string;
  afterNodeId?: string;
}): Promise<Node> {
  const { nodeId, targetParentId, allNodes } = opts;

  // Cycle detection: targetParent must not be a descendant of the node
  if (targetParentId && isDescendant(nodeId, targetParentId, allNodes)) {
    throw new Error("No se puede mover un nodo dentro de sus propios descendientes");
  }

  // Calculate new position
  let newPosition: number;
  if (opts.beforeNodeId && opts.afterNodeId) {
    const before = allNodes.find((n) => n.id === opts.beforeNodeId);
    const after = allNodes.find((n) => n.id === opts.afterNodeId);
    newPosition = calculatePosition(before?.position, after?.position);
  } else if (opts.afterNodeId) {
    const after = allNodes.find((n) => n.id === opts.afterNodeId);
    newPosition = calculatePosition(undefined, after?.position);
  } else if (opts.beforeNodeId) {
    const before = allNodes.find((n) => n.id === opts.beforeNodeId);
    newPosition = calculatePosition(before?.position, undefined);
  } else {
    const siblings = allNodes.filter(
      (n) =>
        n.parent_id === targetParentId &&
        n.id !== nodeId &&
        !n.deleted_at
    );
    const maxPos = siblings.reduce((m, n) => Math.max(m, n.position), 0);
    newPosition = maxPos + 1000;
  }

  const { data: node, error } = await supabase
    .from("nodes")
    .update({
      parent_id: targetParentId,
      position: newPosition,
      updated_at: new Date().toISOString(),
    })
    .eq("id", nodeId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Renormalize if positions get too small
  if (newPosition < 0.001) {
    await renormalizePositions(node.workspace_id, targetParentId);
  }

  return node;
}

async function renormalizePositions(
  workspaceId: string,
  parentId: string | null
): Promise<void> {
  const query = supabase
    .from("nodes")
    .select("id, position")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("position");

  if (parentId) query.eq("parent_id", parentId);
  else query.is("parent_id", null);

  const { data: siblings } = await query;
  if (!siblings) return;

  const updates = siblings.map((n, i) => ({
    id: n.id,
    position: (i + 1) * 1000,
  }));

  await Promise.all(
    updates.map((u) =>
      supabase.from("nodes").update({ position: u.position }).eq("id", u.id)
    )
  );
}

// ── duplicateNode (via Edge Function) ────────────────────────────────────────

export async function duplicateNode(
  nodeId: string
): Promise<{ new_node_id: string; count: number }> {
  const { data, error } = await supabase.functions.invoke("duplicate-node", {
    body: { node_id: nodeId },
  });

  if (error) throw new Error(error.message);
  return data as { new_node_id: string; count: number };
}

// ── trashNode ─────────────────────────────────────────────────────────────────

export async function trashNode(id: string, userId: string): Promise<void> {
  // The cascade_soft_delete trigger handles cascading to descendants
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("nodes")
    .update({ deleted_at: now, deleted_by: userId })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// ── restoreNode ───────────────────────────────────────────────────────────────

export async function restoreNode(
  id: string,
  allNodes: Node[]
): Promise<void> {
  const node = allNodes.find((n) => n.id === id);
  if (!node) throw new Error("Node not found");

  // Check if original parent still exists and is not deleted
  let targetParentId: string | null = node.parent_id;
  if (targetParentId) {
    const parent = allNodes.find((n) => n.id === targetParentId);
    if (!parent || parent.deleted_at) {
      targetParentId = null; // Restore to root
    }
  }

  // Get all descendants in trash (nodes whose path leads to this node)
  const allDeleted = allNodes.filter((n) => n.deleted_at);
  const subtreeIds = getSubtreeIds(id, allDeleted);

  // Restore all nodes in the subtree
  const { error } = await supabase
    .from("nodes")
    .update({
      deleted_at: null,
      deleted_by: null,
      parent_id: targetParentId,
      updated_at: new Date().toISOString(),
    })
    .in("id", subtreeIds);

  if (error) throw new Error(error.message);
}

function getSubtreeIds(rootId: string, nodes: Node[]): string[] {
  const result: string[] = [rootId];
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = nodes.filter((n) => n.parent_id === current);
    children.forEach((c) => {
      result.push(c.id);
      queue.push(c.id);
    });
  }
  return result;
}

// ── permanentlyDeleteNode ─────────────────────────────────────────────────────

export async function permanentlyDeleteNode(id: string): Promise<void> {
  // Delete blocks first (FK constraint)
  await supabase.from("blocks").delete().eq("node_id", id);
  // Delete the node
  const { error } = await supabase.from("nodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── toggleFavorite ────────────────────────────────────────────────────────────

export async function toggleFavorite(
  id: string,
  isFav: boolean
): Promise<void> {
  const { error } = await supabase
    .from("nodes")
    .update({ is_favorite: !isFav })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── getNodeTree ───────────────────────────────────────────────────────────────

export async function getNodeTree(workspaceId: string): Promise<{
  tree: TreeNode[];
  flat: Node[];
}> {
  const { data, error } = await supabase
    .from("nodes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("position");

  if (error) throw new Error(error.message);
  const flat = data as Node[];
  return { tree: buildTree(flat), flat };
}

// ── getTrashNodes ─────────────────────────────────────────────────────────────

export async function getTrashNodes(workspaceId: string): Promise<Node[]> {
  const { data, error } = await supabase
    .from("nodes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Node[];
}

// ── searchNodes ───────────────────────────────────────────────────────────────

export async function searchNodes(
  workspaceId: string,
  query: string
): Promise<Node[]> {
  const { data, error } = await supabase
    .from("nodes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .ilike("title", `%${query}%`)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data as Node[];
}

// ── getRecentNodes ────────────────────────────────────────────────────────────

export async function getRecentNodes(
  userId: string,
  workspaceId: string,
  limit = 5
): Promise<Array<{ node: Node; viewed_at: string }>> {
  const { data, error } = await supabase
    .from("recent_views")
    .select("viewed_at, node:nodes!inner(*)")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((rv) => {
      const node = rv.node as Node | null;
      return node && !node.deleted_at;
    })
    .map((rv) => ({
      node: rv.node as Node,
      viewed_at: rv.viewed_at,
    }));
}
