import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const LS_WIDTH = "tasky_sidebar_width";
const LS_COLLAPSED = "tasky_sidebar_collapsed";

function lsKey(workspaceId: string) {
  return `tasky_expanded_${workspaceId}`;
}

export function useSidebarState() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";

  // ── Expanded nodes ───────────────────────────────────────────────────────
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(lsKey(workspaceId));
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });

  // Re-load when workspace changes
  useEffect(() => {
    if (!workspaceId) return;
    try {
      const raw = localStorage.getItem(lsKey(workspaceId));
      setExpandedIds(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setExpandedIds(new Set());
    }
  }, [workspaceId]);

  // Debounced Supabase sync
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistToSupabase = useCallback(
    (ids: Set<string>) => {
      if (!user || !workspaceId) return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        void supabase.from("sidebar_state").upsert(
          {
            user_id: user.id,
            workspace_id: workspaceId,
            expanded_node_ids: Array.from(ids),
          },
          { onConflict: "user_id,workspace_id" }
        );
      }, 1000);
    },
    [user, workspaceId]
  );

  const toggleExpanded = useCallback(
    (nodeId: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        localStorage.setItem(lsKey(workspaceId), JSON.stringify(Array.from(next)));
        persistToSupabase(next);
        return next;
      });
    },
    [workspaceId, persistToSupabase]
  );

  const setExpanded = useCallback(
    (nodeId: string, expanded: boolean) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (expanded) next.add(nodeId);
        else next.delete(nodeId);
        localStorage.setItem(lsKey(workspaceId), JSON.stringify(Array.from(next)));
        persistToSupabase(next);
        return next;
      });
    },
    [workspaceId, persistToSupabase]
  );

  // ── Sidebar width ────────────────────────────────────────────────────────
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const stored = localStorage.getItem(LS_WIDTH);
    return stored ? parseInt(stored, 10) : 260;
  });

  const updateWidth = useCallback((w: number) => {
    const clamped = Math.max(200, Math.min(400, w));
    setSidebarWidth(clamped);
    localStorage.setItem(LS_WIDTH, String(clamped));
  }, []);

  // ── Collapsed ────────────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(LS_COLLAPSED) === "true";
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem(LS_COLLAPSED, String(next));
      return next;
    });
  }, []);

  // Load expanded nodes from Supabase on mount
  useEffect(() => {
    if (!user || !workspaceId) return;
    supabase
      .from("sidebar_state")
      .select("expanded_node_ids")
      .eq("user_id", user.id)
      .eq("workspace_id", workspaceId)
      .single()
      .then(({ data }) => {
        if (data?.expanded_node_ids?.length) {
          const ids = new Set(data.expanded_node_ids);
          setExpandedIds(ids);
          localStorage.setItem(lsKey(workspaceId), JSON.stringify(Array.from(ids)));
        }
      });
  }, [user, workspaceId]);

  return {
    expandedIds,
    toggleExpanded,
    setExpanded,
    sidebarWidth,
    updateWidth,
    collapsed,
    toggleCollapsed,
  };
}
