import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NodeRow {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  type: string;
  title: string;
  icon: string | null;
  cover_url: string | null;
  position: number;
  is_favorite: boolean;
  is_locked: boolean;
  archived_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface BlockRow {
  id: string;
  node_id: string;
  parent_block_id: string | null;
  type: string;
  props: Record<string, unknown>;
  position: number;
  schema_version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function getSubtree(rootId: string, allNodes: NodeRow[]): NodeRow[] {
  const result: NodeRow[] = [];
  const queue = [rootId];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = allNodes.find((n) => n.id === id);
    if (node) {
      result.push(node);
      allNodes
        .filter((n) => n.parent_id === id)
        .forEach((c) => queue.push(c.id));
    }
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { node_id } = await req.json();
    if (!node_id) {
      return new Response(JSON.stringify({ error: "node_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate user
    const authHeader = req.headers.get("authorization");
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { authorization: authHeader! } } }
    );
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for privileged operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get source node
    const { data: sourceNode, error: nodeError } = await supabase
      .from("nodes")
      .select("*")
      .eq("id", node_id)
      .single();

    if (nodeError || !sourceNode) {
      return new Response(JSON.stringify({ error: "Node not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check workspace membership
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", sourceNode.workspace_id)
      .eq("user_id", user.id)
      .single();

    if (!member || member.role === "viewer") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all nodes in workspace for subtree building
    const { data: allNodes } = await supabase
      .from("nodes")
      .select("*")
      .eq("workspace_id", sourceNode.workspace_id)
      .is("deleted_at", null);

    const subtree = getSubtree(node_id, (allNodes ?? []) as NodeRow[]);

    // Build ID map: old ID → new UUID
    const idMap = new Map<string, string>();
    subtree.forEach((n) => {
      idMap.set(n.id, crypto.randomUUID());
    });

    const now = new Date().toISOString();

    // Build copies
    const copies: Omit<NodeRow, "id"> & { id: string }[] = subtree.map((n) => ({
      ...n,
      id: idMap.get(n.id)!,
      // Remap parent: root node keeps original parent; others get remapped parent
      parent_id:
        n.id === node_id
          ? n.parent_id
          : (idMap.get(n.parent_id!) ?? n.parent_id),
      title: n.id === node_id ? `${n.title} (copia)` : n.title,
      position:
        n.id === node_id ? n.position + 1 : n.position,
      created_by: user.id,
      created_at: now,
      updated_at: now,
      is_favorite: false,
      deleted_at: null,
      deleted_by: null,
      archived_at: null,
    }));

    const { error: insertError } = await supabase.from("nodes").insert(copies);
    if (insertError) throw new Error(insertError.message);

    // Copy blocks for page nodes
    const pageNodeIds = subtree
      .filter((n) => n.type === "page")
      .map((n) => n.id);

    if (pageNodeIds.length > 0) {
      const { data: blocks } = await supabase
        .from("blocks")
        .select("*")
        .in("node_id", pageNodeIds);

      if (blocks && blocks.length > 0) {
        const blockIdMap = new Map<string, string>();
        (blocks as BlockRow[]).forEach((b) => {
          blockIdMap.set(b.id, crypto.randomUUID());
        });

        const blockCopies = (blocks as BlockRow[]).map((b) => ({
          ...b,
          id: blockIdMap.get(b.id)!,
          node_id: idMap.get(b.node_id) ?? b.node_id,
          parent_block_id: b.parent_block_id
            ? (blockIdMap.get(b.parent_block_id) ?? b.parent_block_id)
            : null,
          created_by: user.id,
          created_at: now,
          updated_at: now,
        }));

        await supabase.from("blocks").insert(blockCopies);
      }
    }

    return new Response(
      JSON.stringify({
        new_node_id: idMap.get(node_id),
        count: copies.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
