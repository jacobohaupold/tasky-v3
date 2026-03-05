import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import type { Database } from "@/types/database";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];

interface WorkspaceContextValue {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  switchWorkspace: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  currentWorkspace: null,
  workspaces: [],
  isLoading: true,
  switchWorkspace: () => {},
});

const STORAGE_KEY = "tasky_workspace_id";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  );

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["workspaces", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*, workspace_members!inner(user_id)")
        .eq("workspace_members.user_id", user!.id)
        .order("name");

      if (error) throw error;
      return data as Workspace[];
    },
  });

  // Auto-select first workspace if none stored
  useEffect(() => {
    if (!activeId && workspaces.length > 0) {
      setActiveId(workspaces[0].id);
      localStorage.setItem(STORAGE_KEY, workspaces[0].id);
    }
  }, [activeId, workspaces]);

  const switchWorkspace = useCallback(
    (id: string) => {
      setActiveId(id);
      localStorage.setItem(STORAGE_KEY, id);
      void queryClient.invalidateQueries({ queryKey: ["nodes"] });
      void queryClient.invalidateQueries({ queryKey: ["sidebar_state"] });
    },
    [queryClient]
  );

  const currentWorkspace =
    workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null;

  return (
    <WorkspaceContext.Provider
      value={{ currentWorkspace, workspaces, isLoading, switchWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
