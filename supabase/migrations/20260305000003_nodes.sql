-- ============================================================
-- Migration 003 — Node Tree (Pages, Folders, Collections)
-- ============================================================

-- ── nodes ─────────────────────────────────────────────────
CREATE TABLE public.nodes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type          text        NOT NULL
                            CHECK (type IN (
                              'folder','page','collection','collection_item','shortcut'
                            )),
  parent_id     uuid        REFERENCES public.nodes(id) ON DELETE SET NULL,
  position      numeric     NOT NULL DEFAULT 0,
  title         text        NOT NULL DEFAULT 'Untitled',
  icon          text,
  cover_url     text,
  is_favorite   bool        NOT NULL DEFAULT false,
  is_locked     bool        NOT NULL DEFAULT false,
  archived_at   timestamptz,
  deleted_at    timestamptz,
  deleted_by    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Main query index: workspace tree navigation
CREATE INDEX idx_nodes_tree
  ON public.nodes(workspace_id, parent_id, deleted_at, position)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_nodes_type
  ON public.nodes(workspace_id, type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_nodes_favorites
  ON public.nodes(workspace_id, is_favorite)
  WHERE is_favorite = true AND deleted_at IS NULL;

CREATE INDEX idx_nodes_archived
  ON public.nodes(workspace_id, archived_at)
  WHERE archived_at IS NOT NULL AND deleted_at IS NULL;

-- Full-text search on title
CREATE INDEX idx_nodes_title_gin
  ON public.nodes USING gin(to_tsvector('simple', title));

CREATE TRIGGER nodes_updated_at
  BEFORE UPDATE ON public.nodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;

-- ── node_permissions ──────────────────────────────────────
CREATE TABLE public.node_permissions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id       uuid        NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  subject_type  text        NOT NULL
                            CHECK (subject_type IN ('user','role','workspace','public')),
  subject_id    text,
  access        text        NOT NULL
                            CHECK (access IN ('view','comment','edit','full')),
  inherited     bool        NOT NULL DEFAULT true,
  created_by    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_node_perms_node ON public.node_permissions(node_id);
CREATE INDEX idx_node_perms_subject ON public.node_permissions(subject_type, subject_id);

ALTER TABLE public.node_permissions ENABLE ROW LEVEL SECURITY;

-- ── user_favorites ────────────────────────────────────────
CREATE TABLE public.user_favorites (
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_id       uuid        NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  workspace_id  uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, node_id)
);

CREATE INDEX idx_favorites_workspace ON public.user_favorites(user_id, workspace_id);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- ── recent_views ──────────────────────────────────────────
CREATE TABLE public.recent_views (
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_id       uuid        NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  workspace_id  uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  viewed_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, node_id)
);

CREATE INDEX idx_recent_views_user ON public.recent_views(user_id, viewed_at DESC);

ALTER TABLE public.recent_views ENABLE ROW LEVEL SECURITY;

-- ── sidebar_state ─────────────────────────────────────────
CREATE TABLE public.sidebar_state (
  user_id           uuid    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id      uuid    NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  expanded_node_ids uuid[]  NOT NULL DEFAULT '{}',
  active_node_id    uuid    REFERENCES public.nodes(id) ON DELETE SET NULL,
  scroll_position   int     NOT NULL DEFAULT 0,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, workspace_id)
);

ALTER TABLE public.sidebar_state ENABLE ROW LEVEL SECURITY;
