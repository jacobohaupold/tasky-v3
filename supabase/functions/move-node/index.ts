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
  position: number;
  deleted_at: string | null;
}

/** Check if potentialDescendant is inside subtree rooted at ancestorId */
function isDescendant(
  ancestorId: string,
  potentialDescendantId: string,
  allNodes: NodeRow[]
): boolean {
  const descendants = new Set<string>();
  const queue = [ancestorId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const children = allNodes.filter(
      (n) => n.parent_id === id && !n.deleted_at
    );
    children.forEach((c) => {
      if (!descendants.has(c.id)) {
        descendants.add(c.id);
        queue.push(c.id);
      }
    });
  }
  return descendants.has(potentialDescendantId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      node_id,
      target_parent_id,
      position,
    }: {
      node_id: string;
      target_parent_id: string | null;
      position: number;
    } = body;

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get source node
    const { data: sourceNode, error: nodeError } = await supabase
      .from("nodes")
      .select("id, workspace_id, parent_id, position, deleted_at")
      .eq("id", node_id)
      .single();

    if (nodeError || !sourceNode) {
      return new Response(JSON.stringify({ error: "Node not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check permissions
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

    // Cycle validation: target_parent_id must not be a descendant of node_id
    if (target_parent_id) {
      const { data: allNodes } = await supabase
        .from("nodes")
        .select("id, workspace_id, parent_id, position, deleted_at")
        .eq("workspace_id", sourceNode.workspace_id);

      if (
        isDescendant(
          node_id,
          target_parent_id,
          (allNodes ?? []) as NodeRow[]
        )
      ) {
        return new Response(
          JSON.stringify({ error: "Cannot move a node into its own descendant" }),
          {
            status: 422,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Perform the move
    const { data: updatedNode, error: updateError } = await supabase
      .from("nodes")
      .update({
        parent_id: target_parent_id,
        position: position ?? sourceNode.position,
        updated_at: new Date().toISOString(),
      })
      .eq("id", node_id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    return new Response(JSON.stringify({ node: updatedNode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
