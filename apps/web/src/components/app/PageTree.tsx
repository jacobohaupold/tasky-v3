import { useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  FileText,
  Folder,
  Database,
  LayoutTemplate,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/Dropdown";
import type { TreeNode } from "@/services/nodes.service";

const nodeIcons: Record<string, React.ReactNode> = {
  page: <FileText className="h-3.5 w-3.5" />,
  folder: <Folder className="h-3.5 w-3.5" />,
  database: <Database className="h-3.5 w-3.5" />,
  template: <LayoutTemplate className="h-3.5 w-3.5" />,
  embed: <FileText className="h-3.5 w-3.5" />,
};

interface NodeActionsProps {
  node: TreeNode;
  onRename: (id: string) => void;
  onAddSubpage: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFav: boolean) => void;
}

function NodeActions({
  node,
  onRename,
  onAddSubpage,
  onDelete,
  onToggleFavorite,
}: NodeActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover/node:opacity-100 focus:opacity-100"
          onClick={(e) => e.stopPropagation()}
          aria-label="Opciones del nodo"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onAddSubpage(node.id)}>
          Añadir subpágina
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRename(node.id)}>
          Renombrar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onToggleFavorite(node.id, node.is_favorite)}
        >
          {node.is_favorite ? "Quitar de favoritos" : "Marcar favorito"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void navigator.clipboard.writeText(
              `${window.location.origin}/app/page/${node.id}`
            );
          }}
        >
          Copiar enlace
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={() => onDelete(node.id)}>
          Mover a papelera
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Single sortable node ───────────────────────────────────────────────────────
interface PageTreeNodeProps {
  node: TreeNode;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onRename: (id: string) => void;
  onAddSubpage: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFav: boolean) => void;
  renamingId: string | null;
  onRenameCommit: (id: string, title: string) => void;
}

function PageTreeNode({
  node,
  depth,
  expandedIds,
  onToggleExpand,
  onRename,
  onAddSubpage,
  onDelete,
  onToggleFavorite,
  renamingId,
  onRenameCommit,
}: PageTreeNodeProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isExpanded = expandedIds.has(node.id);
  const isActive = location.pathname === `/app/page/${node.id}`;
  const hasChildren = node.children.length > 0;
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [renameVal, setRenameVal] = useState(node.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleMouseEnterFolder = () => {
    if (node.type === "folder" && !isExpanded) {
      hoverTimer.current = setTimeout(() => {
        onToggleExpand(node.id);
      }, 500);
    }
  };

  const handleMouseLeaveFolder = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handleClick = () => {
    if (node.type === "folder") {
      onToggleExpand(node.id);
    } else {
      navigate(`/app/page/${node.id}`);
    }
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={{ ...style, paddingLeft: depth * 12 + 8 }}
        className={cn(
          "group/node flex items-center gap-1 pr-2 py-[3px] rounded-[var(--radius-xs)] cursor-pointer",
          "transition-colors select-none",
          isActive
            ? "bg-accent/10 text-accent"
            : "text-text hover:bg-surface-2",
          isDragging && "bg-surface-2"
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnterFolder}
        onMouseLeave={handleMouseLeaveFolder}
        {...attributes}
        {...listeners}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {/* Expand chevron */}
        <button
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren || node.type === "folder") {
              onToggleExpand(node.id);
            }
          }}
        >
          {(hasChildren || node.type === "folder") ? (
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-muted transition-transform stroke-[1.5]",
                isExpanded && "rotate-90"
              )}
            />
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Icon */}
        <span className="flex-shrink-0 text-muted">
          {node.icon ? (
            <span className="text-sm leading-none">{node.icon}</span>
          ) : (
            nodeIcons[node.type] ?? nodeIcons.page
          )}
        </span>

        {/* Title / rename input */}
        {renamingId === node.id ? (
          <input
            autoFocus
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onBlur={() => onRenameCommit(node.id, renameVal)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onRenameCommit(node.id, renameVal);
              if (e.key === "Escape") onRenameCommit(node.id, node.title);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none border-b border-accent"
          />
        ) : (
          <span
            className="flex-1 min-w-0 text-sm truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              onRename(node.id);
            }}
          >
            {node.title || "Sin título"}
          </span>
        )}

        {/* Hover actions */}
        <span className="flex items-center gap-0.5 flex-shrink-0">
          <button
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover/node:opacity-100 focus:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onAddSubpage(node.id);
            }}
            aria-label="Añadir subpágina"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <NodeActions
            node={node}
            onRename={onRename}
            onAddSubpage={onAddSubpage}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        </span>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <SortableContext
          items={node.children.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children.map((child) => (
            <PageTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onRename={onRename}
              onAddSubpage={onAddSubpage}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              renamingId={renamingId}
              onRenameCommit={onRenameCommit}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}

// ── Tree root ─────────────────────────────────────────────────────────────────
interface PageTreeProps {
  nodes: TreeNode[];
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onCreateNode: (opts: { type: string; parent_id?: string | null }) => void;
  onRenameNode: (id: string, title: string) => void;
  onDeleteNode: (id: string) => void;
  onMoveNode: (id: string, newParentId: string | null, position: number) => void;
  onToggleFavorite: (id: string, isFav: boolean) => void;
}

export function PageTree({
  nodes,
  expandedIds,
  onToggleExpand,
  onCreateNode,
  onRenameNode,
  onDeleteNode,
  onMoveNode,
  onToggleFavorite,
}: PageTreeProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      // Find the active node and determine new position
      const allNodes = flattenTree(nodes);
      const activeNode = allNodes.find((n) => n.id === active.id);
      const overNode = allNodes.find((n) => n.id === over.id);

      if (!activeNode || !overNode) return;

      // Same parent reorder
      if (activeNode.parent_id === overNode.parent_id) {
        const siblings = allNodes.filter(
          (n) => n.parent_id === activeNode.parent_id && n.id !== activeNode.id
        );
        const overIdx = siblings.findIndex((n) => n.id === over.id);
        const newPos =
          overIdx === 0
            ? (siblings[0]?.position ?? 1000) / 2
            : overIdx === siblings.length
            ? (siblings[siblings.length - 1]?.position ?? 1000) + 1000
            : ((siblings[overIdx - 1]?.position ?? 0) +
                (siblings[overIdx]?.position ?? 1000)) /
              2;

        onMoveNode(activeNode.id, activeNode.parent_id, newPos);
      }
    },
    [nodes, onMoveNode]
  );

  const handleRenameCommit = useCallback(
    (id: string, title: string) => {
      onRenameNode(id, title.trim() || "Sin título");
      setRenamingId(null);
    },
    [onRenameNode]
  );

  if (nodes.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-muted">
        No hay páginas aún.{" "}
        <button
          className="text-accent underline underline-offset-2"
          onClick={() => onCreateNode({ type: "page", parent_id: null })}
        >
          Crear una
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={nodes.map((n) => n.id)}
        strategy={verticalListSortingStrategy}
      >
        <div role="tree" className="px-1">
          {nodes.map((node) => (
            <PageTreeNode
              key={node.id}
              node={node}
              depth={0}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onRename={setRenamingId}
              onAddSubpage={(id) =>
                onCreateNode({ type: "page", parent_id: id })
              }
              onDelete={onDeleteNode}
              onToggleFavorite={onToggleFavorite}
              renamingId={renamingId}
              onRenameCommit={handleRenameCommit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  const visit = (arr: TreeNode[]) => {
    arr.forEach((n) => {
      result.push(n);
      visit(n.children);
    });
  };
  visit(nodes);
  return result;
}
